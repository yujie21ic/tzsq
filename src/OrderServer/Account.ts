import { BitMEXWSAPI } from '../lib/BitMEX/BitMEXWSAPI'
import { createJSONSync, funcList } from './____API____'
import { keys } from 'ramda'
import { BaseType } from '../lib/BaseType'
import { sleep } from '../lib/C/sleep'
import { BitMEXOrderAPI } from '../lib/BitMEX/BitMEXOrderAPI'
import { realData } from './realData'
import { lastNumber } from '../lib/F/lastNumber'
import { to范围 } from '../lib/F/to范围'
import { to价格对齐 } from '../lib/F/to价格对齐'

const toGridPoint = (symbol: BaseType.BitmexSymbol, value: number, side: BaseType.Side) => {
    const grid = symbol === 'XBTUSD' ? 0.5 : 0.05
    return to价格对齐({ grid, side, value })
}

export class Account {
    jsonSync = createJSONSync()
    private ws: BitMEXWSAPI
    //private accountName: string
    private cookie: string

    constructor(p: { accountName: string, cookie: string }) {
        //this.accountName = p.accountName
        this.cookie = p.cookie

        this.ws = new BitMEXWSAPI(p.cookie, [
            { theme: 'margin' },
            { theme: 'position' },
            { theme: 'order' },
        ])

        this.ws.onmessage = frame => {
            if (frame.table === 'margin') {
                this.updateMargin()
            }
            else if (frame.table === 'position') {
                this.updatePosition()
            }
            else if (frame.table === 'order') {
                this.updateOrder()
            }
        }


        this.止损任务('XBTUSD', () => to范围({
            min: 3,
            max: 18,
            value: lastNumber(realData.dataExt.XBTUSD.期货.波动率) / 4,
        }))

        //也用XBTUSD的波动率
        this.止损任务('ETHUSD', () => to范围({
            min: 0.1,
            max: 0.9,
            value: lastNumber(realData.dataExt.XBTUSD.期货.波动率) / 100 + 0.1,
        }))


        this.委托检测任务('XBTUSD')
        this.委托检测任务('ETHUSD')
    }

    private updateMargin() {
        if (this.ws.data.margin.length > 0) {
            const { walletBalance } = this.ws.data.margin[0]
            const { wallet } = this.jsonSync.rawData
            if (wallet.length === 0 || wallet[wallet.length - 1].total !== walletBalance) {
                this.jsonSync.data.wallet.____push({
                    time: new Date(this.ws.data.margin[0].timestamp).getTime(),
                    total: walletBalance
                })
            }
        }
    }

    private updatePosition() {
        keys(this.jsonSync.rawData.symbol).forEach(symbol => {
            const item = this.ws.data.position.find(v => v.symbol === symbol && v.isOpen)
            const { 仓位数量, 开仓均价 } = this.jsonSync.data.symbol[symbol]
            if (item !== undefined) {
                仓位数量.____set(item.currentQty)
                开仓均价.____set(item.avgCostPrice)
            } else {
                仓位数量.____set(0)
                开仓均价.____set(0)
            }
        })
    }

    private updateOrder() {
        keys(this.jsonSync.rawData.symbol).forEach(symbol => {

            const arr = [] as {
                type: '限价' | '限价只减仓' | '止损' | '市价触发'
                id: string
                side: BaseType.Side
                cumQty: number
                orderQty: number
                price: number
            }[]

            this.ws.data.order.filter(v => v.symbol === symbol).forEach(v => {
                if (v.ordType === 'Limit' && v.execInst === 'ParticipateDoNotInitiate' && v.workingIndicator) {
                    arr.push({
                        type: '限价',
                        id: v.orderID,
                        side: v.side as BaseType.Side,
                        cumQty: v.cumQty,
                        orderQty: v.orderQty,
                        price: v.price,
                    })
                }
                else if (v.ordType === 'Limit' && v.execInst === 'ParticipateDoNotInitiate,ReduceOnly' && v.workingIndicator) {
                    arr.push({
                        type: '限价只减仓',
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
                        id: v.orderID,
                        side: v.side as BaseType.Side,
                        cumQty: v.cumQty,
                        orderQty: v.orderQty,
                        price: v.stopPx,
                    })
                }
                else if (v.ordType === 'MarketIfTouched' && v.execInst === 'LastPrice') {
                    arr.push({
                        type: '市价触发',
                        id: v.orderID,
                        side: v.side as BaseType.Side,
                        cumQty: v.cumQty,
                        orderQty: v.orderQty,
                        price: v.stopPx,
                    })
                }
            })

            this.jsonSync.data.symbol[symbol].活动委托.____set(arr)
        })
    }


    async 止损step(symbol: BaseType.BitmexSymbol, 初始止损点: () => number) {
        const { 仓位数量, 开仓均价 } = this.jsonSync.rawData.symbol[symbol]
        const arr = this.jsonSync.rawData.symbol[symbol].活动委托.filter(v => v.type === '止损')

        //没有止损
        if (arr.length === 0) {
            //有仓位 没有止损  初始化止损
            if (仓位数量 !== 0) {
                const 止损点 = 初始止损点()

                if (isNaN(止损点)) return false //波动率还没出来 不止损

                const side = 仓位数量 > 0 ? 'Sell' : 'Buy'

                await BitMEXOrderAPI.stop(this.cookie, {
                    symbol,
                    side,
                    price: toGridPoint(symbol, 仓位数量 > 0 ? 开仓均价 - 止损点 : 开仓均价 + 止损点, side),
                })
                return true
            }
            else {
                return false
            }
        }
        //有止损
        else if (arr.length === 1) {
            //止损方向错了
            if ((仓位数量 > 0 && arr[0].side !== 'Sell') || (仓位数量 < 0 && arr[0].side !== 'Buy')) {
                await BitMEXOrderAPI.cancel(this.cookie, arr.map(v => v.id))
                return true
            }
            else {
                return false
            }

            //只写了BTC的
            //修改止损  只能改小  不能改大
            // const { price, side, id } = arr[0]
            // const 浮盈点数 = this.get浮盈点数(symbol)
            // let 新的Price = NaN

            // if (浮盈点数 > 7) {
            //     新的Price = toGridPoint(symbol, 开仓均价, side)
            // }
            // else if (浮盈点数 > 15) {
            //     新的Price = toGridPoint(symbol, 开仓均价 + (side === 'Buy' ? - 3 : 3), side)
            // }

            // if (isNaN(新的Price)) {
            //     return false
            // }
            // else if (
            //     (side === 'Buy' && 新的Price < price) ||
            //     (side === 'Sell' && 新的Price > price)
            // ) {
            //     await BitMEXOrderAPI.updateStop(this.cookie, {
            //         orderID: id,
            //         price: 新的Price,
            //     })
            //     return true
            // }
        }
        else {
            //多个止损 全部清空
            await BitMEXOrderAPI.cancel(this.cookie, arr.map(v => v.id))
            return true
        }
    }


    async 止损任务(symbol: BaseType.BitmexSymbol, 初始止损点: () => number) {
        while (true) {
            if (await this.止损step(symbol, 初始止损点)) {
                await sleep(2000) //发了请求 休息2秒
            }
            await sleep(500)
        }
    }

    async 委托检测step(symbol: BaseType.BitmexSymbol) {
        const { 仓位数量 } = this.jsonSync.rawData.symbol[symbol]
        const 限价 = this.jsonSync.rawData.symbol[symbol].活动委托.filter(v => v.type === '限价')
        const 限价只减仓 = this.jsonSync.rawData.symbol[symbol].活动委托.filter(v => v.type === '限价只减仓')
        const 市价触发 = this.jsonSync.rawData.symbol[symbol].活动委托.filter(v => v.type === '市价触发')
        const arr = [...限价, ...限价只减仓, ...市价触发]

        //没有委托
        if (arr.length === 0) {
            return false
        }
        else if (arr.length === 1) {
            //没有仓位随便
            //有仓位 只能有减仓委托
            if (仓位数量 !== 0 && 限价只减仓.length === 0) {
                await BitMEXOrderAPI.cancel(this.cookie, arr.map(v => v.id))
                return true
            } else {
                return false
            }
        }
        else {
            //多个委托  全部给取消
            await BitMEXOrderAPI.cancel(this.cookie, arr.map(v => v.id))
            return true
        }
    }

    async 委托检测任务(symbol: BaseType.BitmexSymbol) {
        while (true) {
            if (await this.委托检测step(symbol)) {
                await sleep(2000) //发了请求 休息2秒 
            }
            await sleep(500)
        }
    }

    get浮盈点数(symbol: BaseType.BitmexSymbol) {
        const 最新价 = realData.期货价格dic.get(symbol)
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


    下单 = async (req: typeof funcList.下单.req) => {

        if (req.symbol !== 'XBTUSD' && req.symbol !== 'ETHUSD') {
            throw 'symbol不存在'
        }


        const getPrice最高最低 = () => {
            const price = realData.getOrderPrice(req.symbol, req.side, req.type)
            const { high, low } = realData.get期货多少秒内最高最低(req.symbol, 5)
            if (req.side === 'Buy') {
                return Math.min(price, low)
            } else {
                return Math.max(price, high)
            }
        }

        const getPrice买1卖1 = () => realData.getOrderPrice(req.symbol, req.side, req.type)

        const getPrice = req.最低_最高 ? getPrice最高最低 : getPrice买1卖1

        if (isNaN(getPrice())) {
            throw '服务器还没有 买1 卖1 价格'
        }


        const symbol = req.symbol
        const { 仓位数量 } = this.jsonSync.rawData.symbol[symbol]
        const arr = this.jsonSync.rawData.symbol[symbol].活动委托.filter(v =>
            v.type === '限价' || v.type === '限价只减仓' || v.type === '市价触发'
        )

        if (arr.length === 1) {
            //更新 限价委托
            if (arr[0].type === '限价' && arr[0].side === req.side && req.type === 'maker') {
                return await BitMEXOrderAPI.updateMaker(req.cookie, {
                    orderID: arr[0].id,
                    price: getPrice,
                })
            } else {
                throw '已经有委托了'
            }
        }
        else if (arr.length > 0) {
            throw '已经有委托了'
        }

        if ((仓位数量 > 0 && req.side !== 'Sell') ||
            (仓位数量 < 0 && req.side !== 'Buy')
        ) {
            throw '不能加仓'
        }




        return req.type === 'taker' ?
            (req.最低_最高 ?
                await BitMEXOrderAPI.市价触发(req.cookie, {
                    symbol: req.symbol,
                    side: req.side,
                    size: req.size,
                    price: getPrice(),
                }) :
                await BitMEXOrderAPI.taker(req.cookie, {
                    symbol: req.symbol,
                    side: req.side,
                    size: req.size,
                })
            ) :
            await BitMEXOrderAPI.maker(req.cookie, {
                symbol: req.symbol,
                side: req.side,
                size: req.size,
                price: getPrice,
                reduceOnly: 仓位数量 > 0,
            })
    }

}
