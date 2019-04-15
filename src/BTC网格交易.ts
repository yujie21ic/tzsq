import { BaseType } from './lib/BaseType'
import { range } from 'ramda'
import { PositionAndOrder } from './lib/____API____/PositionAndOrder/PositionAndOrder'
import { PositionAndOrderTask } from './lib/____API____/PositionAndOrder/PositionAndOrder'
import { lastNumber } from './lib/F/lastNumber'
import { BTC网格交易__参数 } from './BTC网格交易__参数'

export class BTC网格交易 implements PositionAndOrderTask {

    private self = {} as PositionAndOrder
    private lastBuyPrice = NaN
    private lastSellPrice = NaN

    private get仓位数量 = () => this.self.jsonSync.rawData.market.bitmex.XBTUSD.仓位数量

    private get开仓均价 = () => this.self.jsonSync.rawData.market.bitmex.XBTUSD.开仓均价

    private getBuy1 = () => lastNumber(this.self.realData.dataExt.XBTUSD.bitmex.买.盘口1价)

    private getSell1 = () => lastNumber(this.self.realData.dataExt.XBTUSD.bitmex.卖.盘口1价)

    private toList = (side: BaseType.Side, price: number, reduceOnly: boolean) =>
        range(0, 50).map(i =>
            ({
                side,
                price: side === 'Buy' ? price - i * BTC网格交易__参数.单个格子大小 : price + i * BTC网格交易__参数.单个格子大小,
                size: BTC网格交易__参数.单个格子数量,
                reduceOnly,
            })
        )

    onFilled(p: {
        symbol: BaseType.BitmexSymbol
        side: BaseType.Side
        price: number
        size: number
        type: '限价' | '限价只减仓' | '止损' | '强平'
    }) {
        console.log('onFilled', JSON.stringify(p))
        if (p.symbol === 'XBTUSD') {
            if (p.side === 'Buy') {
                this.lastBuyPrice = p.price
            } else {
                this.lastSellPrice = p.price
            }
        }
    }

    onHopexTick(self: PositionAndOrder) {
        return false
    }

    private 同一个价位不连续挂2次 = (v: { side: BaseType.Side, price: number }) =>
        (v.side === 'Buy' && v.price !== this.lastBuyPrice) || (v.side === 'Sell' && v.price !== this.lastSellPrice)

    onTick(self: PositionAndOrder) {
        this.self = self
        return this.sync委托列表([
            ...this.get加仓().filter(this.同一个价位不连续挂2次).slice(0, BTC网格交易__参数.格数),
            ...this.get减仓().filter(this.同一个价位不连续挂2次).slice(0, BTC网格交易__参数.格数),
        ])
    }


    //盈利加仓 数量判断
    // to价格对齐({
    //     side: 'Sell',
    //     value: price,
    //     grid: BTC网格交易__参数.单个格子大小
    // })  


    private get减仓() {
        // let arr: { side: BaseType.Side, price: number, size: number, reduceOnly: boolean }[] = []
        return this.toList(BTC网格交易__参数.方向 === 'Sell' ? 'Buy' : 'Sell', 1000, true)
    }

    private get加仓() {
        return this.toList(BTC网格交易__参数.方向, 1000, false)
    }


    private sync委托列表(arr: { side: BaseType.Side, price: number, size: number, reduceOnly: boolean }[]) {

        //price 不能重复
        let dic: { [price: number]: { side: BaseType.Side, size: number, reduceOnly: boolean } } = {}

        arr.forEach(v => {
            dic[v.price] = { side: v.side, size: v.size, reduceOnly: v.reduceOnly }
        })

        let cancelIDs: string[] = []

        this.self.jsonSync.rawData.market.bitmex.XBTUSD.委托列表.forEach(v => {
            const PRICE = v.price

            //这个价格没有委托 取消掉
            if (dic[PRICE] === undefined) {
                cancelIDs.push(v.id)
            }
            // 委托数量不一样 取消掉
            else if (v.orderQty !== dic[PRICE].size) {
                cancelIDs.push(v.id)
            }
            //委托数量一样
            else {
                delete dic[PRICE]
            }
        })


        if (cancelIDs.length !== 0) {
            console.log('取消', cancelIDs)
            return this.self.cancel({ orderID: cancelIDs })
        } else {
            let arr: { side: BaseType.Side, price: number, size: number, reduceOnly: boolean }[] = []
            for (const price in dic) {
                arr.push({
                    side: dic[price].side,
                    price: Number(price),
                    size: dic[price].size,
                    reduceOnly: dic[price].reduceOnly,
                })
            }
            if (arr.length !== 0) {
                console.log('maker多个', arr)
                return this.self.maker多个({ symbol: 'XBTUSD', arr })
            } else {
                return false
            }
        }
    }

}