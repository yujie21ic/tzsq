import { BitMEXWSAPI } from '../lib/BitMEX/BitMEXWSAPI'
import { createJSONSync, funcList } from './____API____'
import { keys } from 'ramda'
import { BaseType } from '../lib/BaseType'
import { sleep } from '../lib/C/sleep'
import { BitMEXOrderAPI, BitMEXOrderAPI__logToFile } from '../lib/BitMEX/BitMEXOrderAPI'
import { realData } from './realData'
import { to范围 } from '../lib/F/to范围'
import { toBuySellPriceFunc } from '../lib/C/toBuySellPriceFunc'

export class TradeAccount {
    jsonSync = createJSONSync()
    private ws: BitMEXWSAPI

    accountName: string
    cookie: string

    order手动: BitMEXOrderAPI
    order自动: BitMEXOrderAPI

    constructor(p: { accountName: string, cookie: string }) {
        this.accountName = p.accountName
        this.cookie = p.cookie

        this.order手动 = new BitMEXOrderAPI({
            cookie: p.cookie,
            重试几次: 100,
            重试休息多少毫秒: 30,
        })

        this.order自动 = new BitMEXOrderAPI({
            cookie: p.cookie,
            重试几次: 10,
            重试休息多少毫秒: 10,
        })

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
            const raw = this.jsonSync.rawData.symbol[symbol]
            if (item !== undefined) {
                if (raw.仓位数量 !== item.currentQty || raw.开仓均价 !== item.avgCostPrice) {
                    仓位数量.____set(item.currentQty)
                    开仓均价.____set(item.avgCostPrice)
                    BitMEXOrderAPI__logToFile(this.accountName + '.txt', new Date().toLocaleString() + `仓位更新: ${symbol} 仓位数量:${item.currentQty}, 开仓均价:${item.avgCostPrice}`)
                }
            } else {
                if (raw.仓位数量 !== 0 || raw.开仓均价 !== 0) {
                    仓位数量.____set(0)
                    开仓均价.____set(0)
                    BitMEXOrderAPI__logToFile(this.accountName + '.txt', new Date().toLocaleString() + `仓位更新: ${symbol} 仓位数量:0`)
                }
            }
        })
    }

    private updateOrder() {
        keys(this.jsonSync.rawData.symbol).forEach(symbol => {

            const arr = [] as {
                type: '限价' | '限价只减仓' | '止损' | '市价触发'
                timestamp: number
                id: string
                side: BaseType.Side
                cumQty: number
                orderQty: number
                price: number
            }[]

            this.ws.data.order.filter(v => v.symbol === symbol).forEach(v => {
                if (v.ordType === 'Limit' && v.execInst === 'ParticipateDoNotInitiate,ReduceOnly' && v.workingIndicator) {
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
                else if (v.ordType === 'MarketIfTouched' && v.execInst === 'LastPrice') {
                    arr.push({
                        type: '市价触发',
                        timestamp: new Date(v.timestamp).getTime(),
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

    async runTask(func: (self: TradeAccount) => Promise<boolean>) {
        while (true) {
            if (await func(this)) {
                await sleep(2000) //发了请求 休息2秒  TODO 改成事务 不用sleep
            }
            await sleep(100)
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

    市价平仓 = async (req: typeof funcList.市价平仓.req) =>
        await this.order手动.close(req.symbol)

    取消委托 = async (req: typeof funcList.取消委托.req) =>
        await this.order手动.cancel(req.orderID)

    下单 = async (req: typeof funcList.下单.req) => {

        if (req.symbol !== 'XBTUSD' && req.symbol !== 'ETHUSD') {
            throw 'symbol不存在'
        }

        const getOrderPrice = () =>
            realData.getOrderPrice({
                symbol: req.symbol,
                side: req.side,
                type: req.type,
                位置: Math.floor(to范围({ min: 0, max: 4, value: req.位置 }))
            })

        const getPrice = req.最低_最高 ?
            () => {
                const price = getOrderPrice()
                const { high, low } = realData.get期货多少秒内最高最低(req.symbol, 5)
                if (req.side === 'Buy') {
                    return Math.min(price, low)
                } else {
                    return Math.max(price, high)
                }
            } :
            getOrderPrice

        if (req.type === 'maker' && isNaN(getPrice())) {
            throw '服务器还没有 买1 卖1 价格'
        }

        const { 仓位数量 } = this.jsonSync.rawData.symbol[req.symbol]

        const 活动委托 = this.jsonSync.rawData.symbol[req.symbol].活动委托.filter(v =>
            v.type === '限价' || v.type === '限价只减仓' || v.type === '市价触发'
        )

        if (活动委托.length > 1) {
            throw '已经有委托了'
        }
        else if (活动委托.length === 1) {
            //更新 限价委托
            if (
                (
                    活动委托[0].type === '限价' ||
                    活动委托[0].type === '限价只减仓'
                )
                && 活动委托[0].side === req.side && req.type === 'maker') {
                //ws返回有时间  直接给委托列表加一条记录??
                return await this.order手动.updateMaker({
                    orderID: 活动委托[0].id,
                    price: toBuySellPriceFunc(req.side, getPrice),
                })
            } else {
                throw '已经有委托了'
            }
        }


        if ((仓位数量 > 0 && req.side !== 'Sell') ||
            (仓位数量 < 0 && req.side !== 'Buy')
        ) {
            throw '不能加仓'
        }

        return req.type === 'taker' ?
            (req.最低_最高 ?
                await this.order手动.市价触发({
                    symbol: req.symbol,
                    side: req.side,
                    size: req.size,
                    price: getPrice(),
                }) :
                await this.order手动.taker({
                    symbol: req.symbol,
                    side: req.side,
                    size: req.size,
                })
            ) :
            //ws返回有时间  直接给委托列表加一条记录??
            await this.order手动.maker({
                symbol: req.symbol,
                side: req.side,
                size: req.size,
                price: toBuySellPriceFunc(req.side, getPrice),
                reduceOnly: 仓位数量 !== 0,
            })
    }

}