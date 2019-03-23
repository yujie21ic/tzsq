import { BaseType } from '../../BaseType'
import { BitMEXRESTAPI } from '../BitMEX/BitMEXRESTAPI'
import { sleep } from '../../C/sleep'
import { JSONRequestError } from '../../C/JSONRequest'
import { logToFile } from '../../C/logToFile'
import { keys } from 'ramda'
import { JSONSync } from '../../C/JSONSync'
import { BitMEXWSAPI } from '../BitMEX/BitMEXWSAPI'
import { RealData__Server } from '../../../RealDataServer/RealData__Server'
import { toCacheFunc } from '../../C/toCacheFunc'
import { PositionAndOrder, PositionAndOrderTask } from './PositionAndOrder'
import { lastNumber } from '../../F/lastNumber'
import { HopexRESTAPI } from '../Hopex/HopexRESTAPI'

const symbol = () => ({
    任务开关: {
        自动开仓摸顶: false,
        自动开仓抄底: false,
        自动开仓追涨: false,
        自动开仓追跌: false,
        自动止盈波段: false,
        自动推止损: true,
    },
    活动委托: [] as Order[],
    仓位数量: 0,
    开仓均价: 0,
})

export const createJSONSync = () =>
    new JSONSync({
        wallet: [] as {
            time: number
            total: number
        }[],
        symbol: {
            XBTUSD: symbol(),
            ETHUSD: symbol(),
            Hopex_BTC: symbol(),
        }
    })

type Order = {
    type: '限价' | '限价只减仓' | '止损'
    timestamp: number
    id: string
    side: BaseType.Side
    cumQty: number      //成交数量
    orderQty: number    //委托数量
    price: number
}

let callID = 0

const 重试几次 = 10
const 重试休息多少毫秒 = 10



export class BitmexPositionAndOrder implements PositionAndOrder {

    private cookie: string
    private hopexCookie: string
    private log = (text: string) => { }
    private ws: BitMEXWSAPI


    get本地维护仓位数量(symbol: BaseType.BitmexSymbol) {
        return this.ws.仓位数量.get(symbol)
    }

    jsonSync = createJSONSync()


    private bitmex_初始化 = {
        仓位: false,
        委托: false,
    }

    private hopex_初始化 = {
        仓位: false,
        委托: false,
    }

    async hopex_轮询() {
        const a = await HopexRESTAPI.getPositions(this.hopexCookie)
        if (a.data !== undefined) {
            this.hopex_初始化.仓位 = true

            let 仓位数量 = 0
            let 开仓均价 = 0
            a.data.data.forEach(v => {
                if (v.contractCode === 'BTCUSDT') {
                    仓位数量 = Number(v.positionQuantity)
                    开仓均价 = v.entryPriceD
                }
            })
            this.jsonSync.data.symbol.Hopex_BTC.仓位数量.____set(仓位数量)
            this.jsonSync.data.symbol.Hopex_BTC.开仓均价.____set(开仓均价)

        } else {
            this.hopex_初始化.仓位 = false
        }

        const b = await HopexRESTAPI.getConditionOrders(this.hopexCookie)
        if (b.data !== undefined) {
            this.hopex_初始化.委托 = true

            let orderArr: Order[] = []
            b.data.data.result.forEach(v => {
                if (v.contractCode === 'BTCUSDT' && v.failureReason === '未触发') {
                    orderArr = [{
                        type: '止损',
                        timestamp: v.timestamp,
                        id: String(v.taskId),
                        side: v.taskTypeD === '买入止损' ? 'Buy' : 'Sell',
                        cumQty: 0,
                        orderQty: 100000,
                        price: Number(v.trigPrice),
                    }]
                }
            })
            this.jsonSync.data.symbol.Hopex_BTC.活动委托.____set(orderArr)

        } else {
            this.hopex_初始化.委托 = false
        }
    }


    constructor(p: { accountName: string, cookie: string, hopexCookie: string }) {
        this.cookie = p.cookie
        this.hopexCookie = p.hopexCookie

        this.hopex_轮询()

        this.ws = new BitMEXWSAPI(p.cookie, [
            { theme: 'margin' },
            { theme: 'position' },
            { theme: 'order' },
        ])

        this.ws.onStatusChange = () => {
            this.bitmex_初始化 = {
                仓位: false,
                委托: false,
            }
        }

        this.log = logToFile(p.accountName + '.txt')
        this.ws.log = logToFile(p.accountName + '.txt')

        this.ws.onmessage = frame => {

            if (frame.table === 'margin') {
                this.updateMargin()
            }
            if (frame.table === 'position') {
                this.bitmex_初始化.仓位 = true
                this.updatePosition()
            }
            else if (frame.table === 'order') {
                this.bitmex_初始化.委托 = true
                this.updateOrder()
            }
        }
    }

    private updateMargin() {
        this.ws.data.margin.forEach(({ walletBalance, timestamp }) => {
            const { wallet } = this.jsonSync.rawData
            if (wallet.length === 0 || wallet[wallet.length - 1].total !== walletBalance) {
                this.jsonSync.data.wallet.____push({
                    time: new Date(timestamp).getTime(),
                    total: walletBalance
                })
            }
        })
    }



    private updatePosition() {
        ['XBTUSD' as 'XBTUSD', 'ETHUSD' as 'ETHUSD'].forEach(symbol => {
            this.ws.data.position.forEach(item => {
                if (item.symbol === symbol) {
                    const { 仓位数量, 开仓均价 } = this.jsonSync.data.symbol[symbol]
                    const raw = this.jsonSync.rawData.symbol[symbol]
                    if (item !== undefined) {
                        if (raw.仓位数量 !== item.currentQty || raw.开仓均价 !== item.avgCostPrice) {
                            仓位数量.____set(item.currentQty)
                            开仓均价.____set(item.avgCostPrice)
                            this.log(`仓位更新: ${symbol} 仓位数量:${item.currentQty}  本地维护仓位数量:${this.ws.仓位数量.get(symbol)}  开仓均价:${item.avgCostPrice}`)
                        }
                    } else {
                        if (raw.仓位数量 !== 0 || raw.开仓均价 !== 0) {
                            仓位数量.____set(0)
                            开仓均价.____set(0)
                            this.log(`仓位更新: ${symbol} 仓位数量:0  本地维护仓位数量:${this.ws.仓位数量.get(symbol)}`)
                        }
                    }
                }
            })

        })
    }

    private updateOrder() {

        keys(this.jsonSync.rawData.symbol).forEach(symbol => {

            const arr = [] as {
                type: '限价' | '限价只减仓' | '止损'
                timestamp: number
                id: string
                side: BaseType.Side
                cumQty: number
                orderQty: number
                price: number
            }[]

            this.ws.data.order.forEach(v => {
                if (v.symbol === symbol) {
                    if (v.ordType === 'Limit' && v.execInst === 'ParticipateDoNotInitiate,ReduceOnly' && v.workingIndicator) {//先检测只减仓
                        arr.push({
                            type: '限价只减仓',
                            timestamp: new Date(v.timestamp).getTime(),
                            id: v.orderID,
                            side: v.side as BaseType.Side,
                            cumQty: v.cumQty,
                            orderQty: v.orderQty,
                            price: v.price,
                        })
                    }
                    else if (v.ordType === 'Limit' /*&& v.execInst === 'ParticipateDoNotInitiate'*/ && v.workingIndicator) { //不勾被动委托也行
                        arr.push({
                            type: '限价',
                            timestamp: new Date(v.timestamp).getTime(),
                            id: v.orderID,
                            side: v.side as BaseType.Side,
                            cumQty: v.cumQty,
                            orderQty: v.orderQty,
                            price: v.price,
                        })
                    }
                    else if (v.ordType === 'Stop' && v.execInst === 'Close,LastPrice') {
                        arr.push({
                            type: '止损',
                            timestamp: new Date(v.timestamp).getTime(),
                            id: v.orderID,
                            side: v.side as BaseType.Side,
                            cumQty: v.cumQty,
                            orderQty: v.orderQty,
                            price: v.stopPx,
                        })
                    }
                }
            })


            this.jsonSync.data.symbol[symbol].活动委托.____set(arr)
        })
    }

    hopex_taker = async (p: { size: number, side: BaseType.Side }) =>
        (await HopexRESTAPI.taker(this.hopexCookie, p)).error === undefined

    hopex_stop = async (p: { side: BaseType.Side, stopPrice: number }) =>
        (await HopexRESTAPI.stop(this.hopexCookie, p)).error === undefined

    hopex_cancel = async (p: { orderID: number }) =>
        (await HopexRESTAPI.cancel(this.hopexCookie, p)).error === undefined


    private DDOS调用 = <P extends any>(f: (cookie: string, p: P) => Promise<{ error?: JSONRequestError, data?: any }>) =>
        async (p: P, logText = '') => {
            const startTime = Date.now()
            let success = false
            let i = 1
            let errMsg = ''
            const __id__ = callID++

            this.log(`__${__id__}__` + (p['text'] || '') + '  ' + logText + '\nsend:' + JSON.stringify(p))

            for (i = 1; i <= 重试几次; i++) {
                const ret = await f(this.cookie, p)

                if (ret.error === '网络错误') {
                    success = false
                    errMsg = JSON.stringify(ret)
                    break
                }
                else if (ret.error === undefined && ret.data !== undefined && ret.data.ordStatus !== 'Canceled' && ret.data.ordStatus !== 'Rejected') {
                    success = true

                    //
                    if (this.ws !== undefined) {
                        if (ret.data.orderID !== undefined && ret.data.ordStatus !== undefined) {
                            this.ws.onAction({
                                action: 'insert',
                                table: 'order',
                                data: [ret.data as any],
                            })
                        }
                    }
                    //

                    break
                }
                await sleep(重试休息多少毫秒)
                if (i === 重试几次) errMsg = JSON.stringify(ret)
            }

            this.log(`__${__id__}__` + `  重试${i}次  ${success ? '成功' : '失败' + errMsg}  耗时:${Date.now() - startTime}ms`)

            if (success === false) {
                await sleep(500)
            }
            return success
        }


    maker = this.DDOS调用<{
        symbol: BaseType.BitmexSymbol
        side: BaseType.Side
        size: number
        price: () => number
        reduceOnly: boolean
        text: string
    }>(
        (cookie, p) => BitMEXRESTAPI.Order.new(cookie, {
            symbol: p.symbol,
            ordType: 'Limit',
            side: p.side,
            orderQty: p.size,
            price: p.price(),
            execInst: p.reduceOnly ? 'ParticipateDoNotInitiate,ReduceOnly' : 'ParticipateDoNotInitiate',
            text: p.text,
        })
    )

    stop = this.DDOS调用<{
        symbol: BaseType.BitmexSymbol
        side: BaseType.Side
        price: number
        text: string
    }>(
        (cookie, p) => BitMEXRESTAPI.Order.new(cookie, {
            symbol: p.symbol,
            ordType: 'Stop',
            stopPx: p.price,
            orderQty: 100000,
            side: p.side,
            execInst: 'Close,LastPrice',
            text: p.text,
        })
    )

    updateStop = this.DDOS调用<{
        orderID: string
        price: number
    }>(
        (cookie, p) => BitMEXRESTAPI.Order.amend(cookie, {
            orderID: p.orderID,
            stopPx: p.price,
        })
    )

    updateMaker = this.DDOS调用<{
        orderID: string
        price: () => number
    }>(
        (cookie, p) => BitMEXRESTAPI.Order.amend(cookie, {
            orderID: p.orderID,
            price: p.price(),
        })
    )

    limit = this.DDOS调用<{
        symbol: BaseType.BitmexSymbol
        side: BaseType.Side
        size: number
        price: () => number
        text: string
    }>(
        (cookie, p) => BitMEXRESTAPI.Order.new(cookie, {
            symbol: p.symbol,
            ordType: 'Limit',
            side: p.side,
            orderQty: p.size,
            price: p.price() + ((p.side === 'Buy' ? 1 : -1) * (p.symbol === 'XBTUSD' ? 0.5 : 0.05)),
            text: p.text,
        })
    )

    taker = this.DDOS调用<{
        symbol: BaseType.BitmexSymbol
        side: BaseType.Side
        size: number
        text: string
    }>(
        (cookie, p) => BitMEXRESTAPI.Order.new(cookie, {
            symbol: p.symbol,
            ordType: 'Market',
            side: p.side,
            orderQty: p.size,
            text: p.text,
        })
    )

    close = this.DDOS调用<{
        symbol: BaseType.BitmexSymbol
        text: string
    }>(
        (cookie, p) => BitMEXRESTAPI.Order.new(cookie, {
            symbol: p.symbol,
            ordType: 'Market',
            execInst: 'Close',
            text: p.text,
        })
    )

    cancel = this.DDOS调用<{
        orderID: string[]
        text: string
    }>(
        (cookie, p) => BitMEXRESTAPI.Order.cancel(cookie, { orderID: JSON.stringify(p.orderID), text: p.text })
    )


    realData = __realData__()

    private async task1(task: PositionAndOrderTask) {
        while (true) {
            if (this.bitmex_初始化.仓位 && this.bitmex_初始化.委托) {
                if (await task.onTick(this)) {
                    await sleep(2000) //发了请求 休息2秒  TODO 改成事务 不用sleep
                }
            }
            await sleep(100)
        }
    }

    private async task2(task: PositionAndOrderTask) {
        while (true) {
            if (this.hopex_初始化.仓位 && this.hopex_初始化.委托) {
                if (await task.onHopexTick(this)) {
                    await sleep(2000) //发了请求 休息2秒  TODO 改成事务 不用sleep
                }
            }
            await sleep(100)
        }
    }

    runTask(task: PositionAndOrderTask) {
        this.ws.filledObservable.subscribe(v => task.onFilled(v))
        this.task1(task)
        this.task2(task)
    }

    get浮盈点数(symbol: BaseType.BitmexSymbol) {
        const 最新价 = lastNumber(this.realData.dataExt[symbol].bitmex.收盘价)
        if (最新价 === undefined) return NaN
        const { 仓位数量, 开仓均价 } = this.jsonSync.rawData.symbol[symbol]
        if (仓位数量 === 0) return NaN
        if (仓位数量 > 0) {
            return 最新价 - 开仓均价
        } else if (仓位数量 < 0) {
            return 开仓均价 - 最新价
        } else {
            return 0
        }
    }
}

const __realData__ = toCacheFunc(() => new RealData__Server(false))