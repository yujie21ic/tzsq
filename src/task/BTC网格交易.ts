import { BaseType } from '../lib/BaseType'
import { range } from 'ramda'
import { PositionAndOrder } from '../lib/____API____/PositionAndOrder/PositionAndOrder'
import { PositionAndOrderTask } from '../lib/____API____/PositionAndOrder/PositionAndOrder'
import { lastNumber } from '../lib/F/lastNumber'
import { to价格对齐 } from '../lib/F/to价格对齐'

export class BTC网格交易 implements PositionAndOrderTask {

    开关 = false
    参数type = {
        单个格子大小: 2.5,
        单个格子数量: 25,
        格数: 5,
        方向: 'Sell' as BaseType.Side,
        最大仓位: 1000,
        盈利加仓: true,
        加仓: true,
        减仓: true,
    }
    参数 = {
        单个格子大小: 2.5,
        单个格子数量: 25,
        格数: 5,
        方向: 'Sell' as BaseType.Side,
        最大仓位: 1000,
        盈利加仓: true,
        加仓: true,
        减仓: true,
    }

    private self = {} as PositionAndOrder
    private lastBuyPrice = NaN
    private lastSellPrice = NaN

    private get仓位数量 = () => this.self.jsonSync.rawData.market.bitmex.XBTUSD.仓位数量

    private get开仓均价 = () => this.self.jsonSync.rawData.market.bitmex.XBTUSD.开仓均价

    private getBuy1 = () => lastNumber(this.self.realData.dataExt.XBTUSD.bitmex.买.盘口1价)

    private getSell1 = () => lastNumber(this.self.realData.dataExt.XBTUSD.bitmex.卖.盘口1价)

    private toList = ({ side, price, reduceOnly }: { side: BaseType.Side, price: number, reduceOnly: boolean }) =>
        range(0, 50).map(i =>
            ({
                side,
                price: side === 'Buy' ? price - i * this.参数.单个格子大小 : price + i * this.参数.单个格子大小,
                size: this.参数.单个格子数量,
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
            ...this.get加仓(),
            ...this.get减仓(),
        ])
    }

    private get减仓() {
        if (this.参数.减仓 === false) return []

        const count = this.get仓位数量()
        const 最大格数 = Math.floor(Math.abs(count) / this.参数.单个格子大小)
        const 格数 = Math.min(最大格数, this.参数.格数)

        if (this.参数.方向 === 'Buy' && count > 0) {
            return this.toList({
                side: 'Sell',
                price: to价格对齐({
                    side: 'Sell',
                    value: Math.max(this.getSell1(), this.get开仓均价()),
                    grid: this.参数.单个格子大小,
                }),
                reduceOnly: true,
            }).filter(this.同一个价位不连续挂2次).slice(0, 格数)
        }
        else if (this.参数.方向 === 'Sell' && count < 0) {
            return this.toList({
                side: 'Buy',
                price: to价格对齐({
                    side: 'Buy',
                    value: Math.min(this.getBuy1(), this.get开仓均价()),
                    grid: this.参数.单个格子大小,
                }),
                reduceOnly: true,
            }).filter(this.同一个价位不连续挂2次).slice(0, 格数)
        } else {
            return []
        }
    }


    private get加仓() {
        if (this.参数.加仓 === false) return []

        const count = this.get仓位数量()
        const 最大格数 = Math.floor((this.参数.最大仓位 - Math.abs(count)) / this.参数.单个格子大小)
        let 格数 = Math.min(最大格数, this.参数.格数)

        if (
            (this.参数.方向 === 'Sell' && count > 0) ||
            (this.参数.方向 === 'Buy' && count < 0)
        ) {
            格数 = this.参数.格数
        }

        return this.toList({
            side: this.参数.方向,
            price: to价格对齐({
                side: this.参数.方向,
                value: this.参数.方向 === 'Sell' ?
                    (this.参数.盈利加仓 ? this.getSell1() : Math.max(this.getSell1(), this.get开仓均价())) :
                    (this.参数.盈利加仓 ? this.getBuy1() : Math.min(this.getBuy1(), this.get开仓均价())),
                grid: this.参数.单个格子大小,
            }),
            reduceOnly: false,
        }).filter(this.同一个价位不连续挂2次).slice(0, 格数)
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