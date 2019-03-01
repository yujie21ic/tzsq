import { funcList } from '../OrderServer/____API____'
import { BaseType } from '../lib/BaseType'
import { sleep } from '../lib/C/sleep'
import { to范围 } from '../lib/F/to范围'
import { toBuySellPriceFunc } from '../lib/C/toBuySellPriceFunc'
import { BitmexPositionAndOrder } from './PositionAndOrder/BitmexPositionAndOrder'
import { RealData__Server } from '../RealDataServer/RealData__Server'
import { RealDataBase } from '../RealDataServer/RealDataBase'


export class TradeAccount {

    //
    static realData: RealDataBase = new RealData__Server(false)
    bitmexPositionAndOrder: BitmexPositionAndOrder
    get ws() { return this.bitmexPositionAndOrder.ws }
    get bitMEXOrderAPI() { return this.bitmexPositionAndOrder.bitMEXOrderAPI }
    get 活动委托() { return this.bitmexPositionAndOrder.活动委托 }
    get jsonSync() { return this.bitmexPositionAndOrder.jsonSync }
    //

    constructor(p: { accountName: string, cookie: string }) {
        this.bitmexPositionAndOrder = new BitmexPositionAndOrder(p)
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
        const 最新价 = TradeAccount.realData.期货价格dic.get(symbol)
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
        await this.bitMEXOrderAPI.close({ symbol: req.symbol, text: '手动市价平仓' })

    取消委托 = async (req: typeof funcList.取消委托.req) =>
        await this.bitMEXOrderAPI.cancel({ orderID: req.orderID, text: '手动取消委托' })

    下单 = async (req: typeof funcList.下单.req) => {

        if (req.symbol !== 'XBTUSD' && req.symbol !== 'ETHUSD') {
            throw 'symbol不存在'
        }

        const getOrderPrice = () =>
            TradeAccount.realData.getOrderPrice({
                symbol: req.symbol,
                side: req.side,
                type: req.type,
                位置: Math.floor(to范围({ min: 0, max: 4, value: req.位置 }))
            })

        const getPrice = req.最低_最高 ?
            () => {
                const price = getOrderPrice()
                const { high, low } = TradeAccount.realData.get期货多少秒内最高最低(req.symbol, 5)
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

        const 活动委托 = this.活动委托[req.symbol].filter(v => v.type !== '止损')

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
                return await this.bitMEXOrderAPI.updateMaker({
                    orderID: 活动委托[0].id,
                    price: toBuySellPriceFunc(req.side, getPrice),
                    text: '手动updateMaker'
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
                false :
                await this.bitMEXOrderAPI.taker({
                    symbol: req.symbol,
                    side: req.side,
                    size: req.size,
                    text: '手动taker',
                })
            ) :
            //ws返回有时间  直接给委托列表加一条记录??
            await this.bitMEXOrderAPI.maker({
                symbol: req.symbol,
                side: req.side,
                size: req.size,
                price: toBuySellPriceFunc(req.side, getPrice),
                reduceOnly: 仓位数量 !== 0,
                text: '手动maker',
            })
    }

}
