import { BaseType } from '../../BaseType'
import { BitMEXHTTP } from '../BitMEX/BitMEXHTTP'
import { sleep } from '../../F/sleep'
import { JSONRequestError } from '../../F/JSONRequest'
import { logToFile } from '../../F/logToFile'
import { keys } from 'ramda'
import { JSONSync } from '../../F/JSONSync'
import { BitMEXWS } from '../BitMEX/BitMEXWS'
import { RealData__Server } from '../../../RealDataServer/RealData__Server'
import { toCacheFunc } from '../../F/toCacheFunc'
import { PositionAndOrder, PositionAndOrderTask } from './PositionAndOrder'
import { HopexHTTP } from '../HopexHTTP'
import { FCoinHTTP } from '../FCoinHTTP'
import { mapObjIndexed } from '../../F/mapObjIndexed'
import { typeObjectParse } from '../../F/typeObjectParse'
import { safeJSONParse } from '../../F/safeJSONParse'

const symbol = () => ({
    委托列表: [] as BaseType.Order[],
    仓位数量: 0,
    开仓均价: 0,
})

export const createJSONSync = () =>
    new JSONSync({
        wallet: [] as {
            time: number
            total: number
        }[],
        任务: [] as {
            名字: string
            开关: boolean
            参数: string
        }[],
        market: {
            hopex: mapObjIndexed(symbol, BaseType.HopexSymbolDic),
            fcoin: {
                btcusdt: symbol(),
                ethusdt: symbol(),
            },
            bitmex: {
                XBTUSD: symbol(),
                ETHUSD: symbol(),
            },
        }
    })



let callID = 0

const 重试几次 = 10
const 重试休息多少毫秒 = 10



export class BitmexPositionAndOrder implements PositionAndOrder {

    private cookie: string
    private hopexCookie: string
    private fcoinCookie: string

    log: (text: string) => void
    private ws: BitMEXWS


    get本地维护仓位数量(symbol: BaseType.BitmexSymbol) {
        return this.ws.仓位数量.get(symbol)
    }

    jsonSync = createJSONSync()


    bitmex_初始化 = {
        仓位: false,
        委托: false,
    }

    hopex_初始化 = {
        仓位: false,
        委托: false,
    }

    private async hopex_仓位_轮询() {
        while (true) {
            const __obj__ = mapObjIndexed(() => ({ 仓位数量: 0, 开仓均价: 0, }), BaseType.HopexSymbolDic)
            const { data } = await HopexHTTP.getPositions(this.hopexCookie)
            if (data !== undefined) {
                this.hopex_初始化.仓位 = true

                const arr = data.data || []
                arr.forEach(v => {
                    __obj__[v.contractCode].仓位数量 = Number(v.positionQuantity.split(',').join(''))
                    __obj__[v.contractCode].开仓均价 = v.entryPriceD
                })

                BaseType.HopexSymbolArr.forEach(symbol => {
                    if (this.jsonSync.rawData.market.hopex[symbol].仓位数量 !== __obj__[symbol].仓位数量) {
                        this.jsonSync.data.market.hopex[symbol].仓位数量.____set(__obj__[symbol].仓位数量)
                        this.log(`hopex ${symbol} 仓位数量: + ${__obj__[symbol].仓位数量}`)
                    }
                    if (this.jsonSync.rawData.market.hopex[symbol].开仓均价 !== __obj__[symbol].开仓均价) {
                        this.jsonSync.data.market.hopex[symbol].开仓均价.____set(__obj__[symbol].开仓均价)
                        this.log(`hopex ${symbol} 开仓均价: + ${__obj__[symbol].开仓均价}`)
                    }
                })

            } else {
                this.hopex_初始化.仓位 = false
                this.log('hopex_初始化.仓位 = false')
            }
            await sleep(1000)
        }
    }

    private async hopex_委托_轮询() {
        while (true) {
            const __obj__ = mapObjIndexed(() => [] as BaseType.Order[], BaseType.HopexSymbolDic)
            const 止损data = (await HopexHTTP.getConditionOrders(this.hopexCookie)).data
            const 委托data = (await HopexHTTP.getOpenOrders(this.hopexCookie)).data

            if (止损data !== undefined && 委托data !== undefined) {
                this.hopex_初始化.委托 = true

                if (止损data.data !== undefined) {
                    const result = 止损data.data ? 止损data.data.result || [] : []
                    result.forEach(v => {
                        if (v.taskStatusD === '未触发') {
                            __obj__[v.contractCode].push({
                                type: '止损',
                                timestamp: v.timestamp,
                                id: String(v.taskId),
                                side: v.taskTypeD === '买入止损' ? 'Buy' : 'Sell',
                                cumQty: 0,
                                orderQty: 100000,
                                price: Number(v.trigPrice.split(',').join('')),
                            })
                        }
                    })
                }
                if (委托data.data !== undefined) {
                    委托data.data.forEach(v => {
                        __obj__[v.contractCode].push({
                            type: '限价',
                            timestamp: new Date(v.ctime).getTime(),
                            id: String(v.orderId),
                            side: v.side === '2' ? 'Buy' : 'Sell',
                            cumQty: Number(v.fillQuantity.split(',').join('')),
                            orderQty: Number(v.leftQuantity.split(',').join('')),
                            price: Number(v.orderPrice.split(',').join('')),
                        })
                    })
                }

                BaseType.HopexSymbolArr.forEach(symbol => {
                    const id1Arr = __obj__[symbol].map(v => v.id).sort().join(',')
                    const id2Arr = this.jsonSync.rawData.market.hopex[symbol].委托列表.map(v => v.id).sort().join(',')

                    if (id1Arr !== id2Arr) {
                        this.jsonSync.data.market.hopex[symbol].委托列表.____set(__obj__[symbol])
                        this.log('hopex ' + symbol + '止损:' + (__obj__[symbol].length > 0 ? __obj__[symbol][0].price : '无'))
                    }
                })

            } else {
                this.hopex_初始化.委托 = false
                this.log('hopex_初始化.委托 = false')
            }
            await sleep(1000)
        }
    }


    private async hopex_轮询() {
        this.hopex_仓位_轮询()
        this.hopex_委托_轮询()
    }

















    private async fcoin_仓位_轮询() {
        while (true) {
            const { data } = await FCoinHTTP.getBalances(this.fcoinCookie)

            if (data !== undefined) {
                const arr = data.data.leveraged_account_resp_list

                let 仓位数量 = 0
                let 开仓均价 = 0

                arr.forEach(v => {
                    if (v.leveraged_account_type === 'btcusdt') {
                        仓位数量 = Number(v.available_base_currency_amount.split(',').join(''))
                        开仓均价 = Number(v.available_quote_currency_amount.split(',').join(''))
                    }
                })

                if (this.jsonSync.rawData.market.fcoin.btcusdt.仓位数量 !== 仓位数量) this.jsonSync.data.market.fcoin.btcusdt.仓位数量.____set(仓位数量)
                if (this.jsonSync.rawData.market.fcoin.btcusdt.开仓均价 !== 开仓均价) this.jsonSync.data.market.fcoin.btcusdt.开仓均价.____set(开仓均价)

            } else {

                if (isNaN(this.jsonSync.rawData.market.fcoin.btcusdt.仓位数量) === false) this.jsonSync.data.market.fcoin.btcusdt.仓位数量.____set(NaN)
                if (isNaN(this.jsonSync.rawData.market.fcoin.btcusdt.开仓均价) === false) this.jsonSync.data.market.fcoin.btcusdt.开仓均价.____set(NaN)
            }
            await sleep(1000)
        }
    }

    private async fcoin_委托_轮询() {
        while (true) {
            const { data } = await FCoinHTTP.getActiveOrders(this.fcoinCookie, { symbol: 'btcusdt' })

            if (data !== undefined) {
                const arr: BaseType.Order[] = data.data.map(v => ({
                    type: '限价' as '限价',
                    timestamp: v.created_at,
                    id: v.id,
                    side: (v.type === 'buy_limit' ? 'Buy' : 'Sell') as BaseType.Side,
                    cumQty: Number(v.filled_amount.split(',').join('')),
                    orderQty: Number(v.amount.split(',').join('')),
                    price: Number(v.price),
                }))

                const id1Arr = arr.map(v => v.id).sort().join(',')
                const id2Arr = this.jsonSync.rawData.market.fcoin.btcusdt.委托列表.map(v => v.id).sort().join(',')

                if (id1Arr !== id2Arr) {
                    this.jsonSync.data.market.fcoin.btcusdt.委托列表.____set(arr)
                }

            } else {
                if (this.jsonSync.rawData.market.fcoin.btcusdt.委托列表.length !== 0) {
                    this.jsonSync.data.market.fcoin.btcusdt.委托列表.____set([])
                }
            }
            await sleep(1000)
        }
    }


    private async fcoin_轮询() {
        this.fcoin_仓位_轮询()
        this.fcoin_委托_轮询()
    }




























    constructor(p: { accountName: string, cookie: string, hopexCookie: string, fcoinCookie: string }) {
        this.cookie = p.cookie
        this.hopexCookie = p.hopexCookie
        this.fcoinCookie = p.fcoinCookie

        if (this.hopexCookie !== '') {
            this.hopex_轮询()
        }

        if (this.fcoinCookie !== '') {
            this.fcoin_轮询()
        }

        this.ws = new BitMEXWS(p.cookie, [
            { theme: 'margin' },
            { theme: 'position', filter: 'XBTUSD' },
            { theme: 'order', filter: 'XBTUSD' },
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
                    const { 仓位数量, 开仓均价 } = this.jsonSync.data.market.bitmex[symbol]
                    const raw = this.jsonSync.rawData.market.bitmex[symbol]
                    if (item !== undefined) {
                        if (raw.仓位数量 !== item.currentQty || raw.开仓均价 !== item.avgCostPrice) {
                            仓位数量.____set(item.currentQty)
                            开仓均价.____set(Number(item.avgCostPrice)) //<---------------------------null to 0
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

        keys(this.jsonSync.rawData.market.bitmex).forEach(symbol => {

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


            this.jsonSync.data.market.bitmex[symbol].委托列表.____set(arr)
        })
    }

    hopex_taker = async (p: { symbol: BaseType.HopexSymbol, size: number, side: BaseType.Side }) => {
        this.log(`hopex_taker ${p.side} ${p.size}`)
        const b = (await HopexHTTP.taker(this.hopexCookie, p)).error === undefined
        this.log(`hopex_taker ${b ? '成功' : '失败'}`)
        if (b) {
            this.hopex_初始化.仓位 = false
        }
        return b
    }

    hopex_stop = async (p: { symbol: BaseType.HopexSymbol, side: BaseType.Side, price: number }) => {
        this.log(`hopex_stop ${p.side} ${p.price}`)
        const b = (await HopexHTTP.stop(this.hopexCookie, p)).error === undefined
        this.log(`hopex_stop ${b ? '成功' : '失败'}`)
        if (b) {
            this.hopex_初始化.委托 = false
        }
        return b
    }

    hopex_cancel = async (p: { symbol: BaseType.HopexSymbol, orderID: string }) => {
        const b = (await HopexHTTP.cancel(this.hopexCookie, {
            orderID: Number(p.orderID),
            contractCode: p.symbol,
        })).error === undefined
        this.log(`hopex_cancel ${b ? '成功' : '失败'}`)
        if (b) {
            this.hopex_初始化.委托 = false
        }
        return b
    }

    private DDOS调用 = <P extends any>(f: (cookie: string, p: P) => Promise<{ error?: JSONRequestError, data?: any }>) =>
        async (p: P) => {
            const startTime = Date.now()
            let success = false
            let i = 1
            let errMsg = ''
            const __id__ = callID++

            this.log(`__${__id__}__` + (p['text'] || '') + '  \nsend:' + JSON.stringify(p))

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

                        //单个委托
                        if (ret.data.orderID !== undefined && ret.data.ordStatus !== undefined) {
                            this.ws.onAction({
                                action: 'insert',
                                table: 'order',
                                data: [ret.data as any],
                            })
                        }

                        //批量委托 批量取消
                        if (Array.isArray(ret.data)) {
                            ret.data.forEach(v => {
                                if (v.orderID !== undefined && v.ordStatus !== undefined) {
                                    this.ws.onAction({
                                        action: 'insert',
                                        table: 'order',
                                        data: [v as any],
                                    })
                                }
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
        (cookie, p) => BitMEXHTTP.Order.new(cookie, {
            symbol: p.symbol,
            ordType: 'Limit',
            side: p.side,
            orderQty: p.size,
            price: p.price(),
            execInst: p.reduceOnly ? 'ParticipateDoNotInitiate,ReduceOnly' : 'ParticipateDoNotInitiate',
            text: p.text,
        })
    )








    maker多个 = this.DDOS调用<{
        symbol: BaseType.BitmexSymbol
        arr: { side: BaseType.Side, price: number, size: number, reduceOnly: boolean }[]
    }>(
        (cookie, p) => BitMEXHTTP.Order.newBulk(cookie, {
            orders: JSON.stringify(p.arr.map(v =>
                ({
                    symbol: p.symbol,
                    ordType: 'Limit',
                    side: v.side,
                    orderQty: v.size,
                    price: v.price,
                    execInst: v.reduceOnly ? 'ParticipateDoNotInitiate,ReduceOnly' : 'ParticipateDoNotInitiate',
                })
            ))
        })
    )








    stop = this.DDOS调用<{
        side: BaseType.Side
        price: number
    }>(
        (cookie, p) => BitMEXHTTP.Order.new(cookie, {
            symbol: 'XBTUSD', //<-----------------------
            ordType: 'Stop',
            stopPx: p.price,
            orderQty: 100000,
            side: p.side,
            execInst: 'Close,LastPrice',
        })
    )

    //!!!!!
    updateStop = this.DDOS调用<{
        orderID: string
        price: number
    }>(
        (cookie, p) => BitMEXHTTP.Order.amend(cookie, {
            orderID: p.orderID,
            stopPx: p.price,
        })
    )

    updateMaker = this.DDOS调用<{
        orderID: string
        price: () => number
    }>(
        (cookie, p) => BitMEXHTTP.Order.amend(cookie, {
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
        (cookie, p) => BitMEXHTTP.Order.new(cookie, {
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
        (cookie, p) => BitMEXHTTP.Order.new(cookie, {
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
        (cookie, p) => BitMEXHTTP.Order.new(cookie, {
            symbol: p.symbol,
            ordType: 'Market',
            execInst: 'Close',
            text: p.text,
        })
    )

    cancel = this.DDOS调用<{
        orderID: string[]
    }>(
        (cookie, p) => BitMEXHTTP.Order.cancel(cookie, { orderID: JSON.stringify(p.orderID) })
    )


    realData = __realData__()

    // private async task1(task: PositionAndOrderTask) {
    //     while (true) {
    //         if (task.开关) {
    //             if (this.bitmex_初始化.仓位 && this.bitmex_初始化.委托) {
    //                 if (await task.onTick(this)) {
    //                     await sleep(2000) //发了请求 休息2秒  TODO 改成事务 不用sleep
    //                 }
    //             }
    //         }
    //         await sleep(100)
    //     }
    // }

    // private async task2(task: PositionAndOrderTask) {
    //     while (true) {
    //         if (task.开关) {
    //             if (this.hopex_初始化.仓位 && this.hopex_初始化.委托) {
    //                 if (await task.onHopexTick(this)) {
    //                     await sleep(2000) //发了请求 休息2秒  TODO 改成事务 不用sleep
    //                 }
    //             }
    //         }
    //         await sleep(100)
    //     }
    // }

    private taskDic = new Map<string, PositionAndOrderTask>()

    runTask(name: string, task: PositionAndOrderTask) {
        this.taskDic.set(name, task)

        this.realData.onTitle = obj => {
            this.log(JSON.stringify(obj))
        }
        this.ws.filledObservable.subscribe(v => task.onFilled(v))


        task.run(this)
        // this.task1(task)
        // this.task2(task)

        this.刷新到jsonsync任务()

        task.on参数更新 = () => {
            this.刷新到jsonsync任务()
        }
    }

    set_任务_开关(p: { 名字: string, 开关: boolean }) {
        const task = this.taskDic.get(p.名字)
        if (task !== undefined) {
            task.开关 = p.开关
            this.刷新到jsonsync任务()
        }
    }

    set_任务_参数(p: { 名字: string, 参数: string }) {
        const task = this.taskDic.get(p.名字)
        if (task !== undefined) {
            task.参数 = typeObjectParse(task.参数type)({ ...task.参数, ...safeJSONParse(p.参数) })
            this.刷新到jsonsync任务()
        }
    }


    private 刷新到jsonsync任务() {
        let arr = [] as { 名字: string, 开关: boolean, 参数: string }[]
        this.taskDic.forEach((v, k) => {
            arr.push({
                名字: k,
                开关: v.开关,
                参数: JSON.stringify(v.参数)
            })
        })
        this.jsonSync.data.任务.____set(arr)
    }
}

const __realData__ = toCacheFunc(() => new RealData__Server(false))