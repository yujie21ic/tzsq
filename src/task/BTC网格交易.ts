import { BaseType } from '../lib/BaseType'
import { range } from 'ramda'
import { PositionAndOrder } from '../lib/____API____/PositionAndOrder/PositionAndOrder'
import { PositionAndOrderTask } from '../lib/____API____/PositionAndOrder/PositionAndOrder'
import { lastNumber } from '../lib/F/lastNumber'
import { to价格对齐 } from '../lib/F/to价格对齐'

export class BTC网格交易 implements PositionAndOrderTask {

    开关 = false
    参数type = {
        单个格子大小: 0.5,
        单个格子数量: 25,
        最小盈利点: 0,
        格数: 1,
        方向: 'Sell' as BaseType.Side,
        最大仓位: 1000,
        留多少不减仓: 0,
        盈利加仓: false,
        亏损减仓: false,
        加仓: false,
        减仓: false,
        止损价格: 0,
    }
    参数 = {
        单个格子大小: 0.5,
        单个格子数量: 25,
        最小盈利点: 0,
        格数: 1,
        方向: 'Buy' as BaseType.Side,
        最大仓位: 1000,
        留多少不减仓: 0,
        盈利加仓: false,
        亏损减仓: false,
        加仓: false,
        减仓: false,
        止损价格: 0,
    }

    private self = {} as PositionAndOrder
    private lastBuyPrice = NaN
    private lastSellPrice = NaN

    private get仓位数量 = () => this.self.jsonSync.rawData.market.bitmex.XBTUSD.仓位数量

    private getBuy1 = () => lastNumber(this.self.realData.dataExt.XBTUSD.bitmex.买.盘口1价)

    private getSell1 = () => lastNumber(this.self.realData.dataExt.XBTUSD.bitmex.卖.盘口1价)

    private sellPrice = (盈利减仓_盈利点 = 0) => Math.max(this.getSell1(), this.self.jsonSync.rawData.market.bitmex.XBTUSD.开仓均价 + 盈利减仓_盈利点)

    private buyPrice = (盈利减仓_盈利点 = 0) => {
        const { 开仓均价 } = this.self.jsonSync.rawData.market.bitmex.XBTUSD
        const buy1 = this.getBuy1()

        if (开仓均价 === 0) {
            return buy1
        } else {
            return Math.min(buy1, 开仓均价 - 盈利减仓_盈利点)
        }
    }


    private toList = ({ side, price, reduceOnly, size }: { side: BaseType.Side, price: number, reduceOnly: boolean, size?: number }) =>
        range(0, 50).map(i =>
            ({
                side,
                price: side === 'Buy' ? price - i * this.参数.单个格子大小 : price + i * this.参数.单个格子大小,
                size: size === undefined ? this.参数.单个格子数量 : size,
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

            if (p.type === '止损' || p.type === '强平') {
                this.开关 = false
                if (this.on参数更新 !== undefined) {
                    this.on参数更新()
                }
            }
        }
    }

    on参数更新?: () => void

    onHopexTick(self: PositionAndOrder) {
        return false
    }

    private 同一个价位不连续挂2次 = (v: { side: BaseType.Side, price: number }) =>
        (v.side === 'Buy' && v.price !== this.lastBuyPrice) || (v.side === 'Sell' && v.price !== this.lastSellPrice)

    onTick(self: PositionAndOrder) {
        this.self = self

        const 止损委托 = self.jsonSync.rawData.market.bitmex.XBTUSD.委托列表.filter(v => v.type === '止损')
        const 止损side = this.参数.方向 === 'Buy' ? 'Sell' : 'Buy'

        if (this.参数.止损价格 !== 0) {
            if (止损委托.length === 0) {
                return self.stop({
                    side: 止损side,
                    price: this.参数.止损价格,
                })
            }
            else if (止损委托.length === 1) {
                if (止损委托[0].side !== 止损side) {
                    return self.cancel({ orderID: 止损委托.map(v => v.id) })
                }
                else if (止损委托[0].price !== this.参数.止损价格) {
                    return self.updateStop({
                        orderID: 止损委托[0].id,
                        price: this.参数.止损价格,
                    })
                }
            } else {
                return self.cancel({ orderID: 止损委托.map(v => v.id) })
            }
        }


        return this.sync委托列表([
            ...this.get加仓(),
            ...this.get减仓(),
        ])
    }

    private get减仓() {
        if (this.参数.减仓 === false) return []

        const count = this.get仓位数量()
        const 剩余 = Math.max(0, (Math.abs(count) - this.参数.留多少不减仓))

        let 格数 = Math.min(this.参数.格数, Math.floor(剩余 / this.参数.单个格子数量))
        let size = this.参数.单个格子数量

        // if (剩余 !== 0 && this.参数.格数 !== 0 && 格数 === 0) {
        //     格数 = 1
        //     size = 剩余
        // }

        if (this.参数.方向 === 'Buy' && count > 0) {
            return this.toList({
                size,
                side: 'Sell',
                price: to价格对齐({
                    side: 'Sell',
                    value: this.参数.亏损减仓 ? this.getSell1() : this.sellPrice(this.参数.最小盈利点),
                    grid: this.参数.单个格子大小,
                }),
                reduceOnly: true,
            }).filter(this.同一个价位不连续挂2次).slice(0, 格数)
        }
        else if (this.参数.方向 === 'Sell' && count < 0) {
            return this.toList({
                size,
                side: 'Buy',
                price: to价格对齐({
                    side: 'Buy',
                    value: this.参数.亏损减仓 ? this.getBuy1() : this.buyPrice(this.参数.最小盈利点),
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
        const 剩余 = Math.max(0,
            ((this.参数.方向 === 'Buy' && count >= 0) || (this.参数.方向 === 'Sell' && count <= 0)) ?
                this.参数.最大仓位 - Math.abs(count) : //方向一致
                this.参数.最大仓位 + Math.abs(count)   //方向不一致
        )

        const 格数 = Math.min(this.参数.格数, Math.floor(剩余 / this.参数.单个格子数量))

        return this.toList({
            side: this.参数.方向,
            price: to价格对齐({
                side: this.参数.方向,
                value: this.参数.方向 === 'Sell' ?
                    (this.参数.盈利加仓 ? this.getSell1() : this.sellPrice()) :
                    (this.参数.盈利加仓 ? this.getBuy1() : this.buyPrice()),
                grid: this.参数.单个格子大小,
            }),
            reduceOnly: false,
        }).filter(this.同一个价位不连续挂2次).filter(v =>
            this.参数.止损价格 === 0 ?
                true :
                this.参数.方向 === 'Buy' ?
                    v.price > this.参数.止损价格 :
                    v.price < this.参数.止损价格
        ).slice(0, 格数)
    }


    private sync委托列表(arr: { side: BaseType.Side, price: number, size: number, reduceOnly: boolean }[]) {

        //price 不能重复
        let dic: { [price: number]: { side: BaseType.Side, size: number, reduceOnly: boolean } } = {}

        arr.forEach(v => {
            dic[v.price] = { side: v.side, size: v.size, reduceOnly: v.reduceOnly }
        })

        let cancelIDs: string[] = []

        this.self.jsonSync.rawData.market.bitmex.XBTUSD.委托列表.filter(v => v.type === '限价' || v.type === '限价只减仓').forEach(v => {
            const PRICE = v.price

            //这个价格没有委托 取消掉
            if (dic[PRICE] === undefined) {
                cancelIDs.push(v.id)
            }
            // 委托数量不一样 取消掉
            else if (v.orderQty !== dic[PRICE].size) {
                cancelIDs.push(v.id)
            }
            // 只减仓模式 不一样 取消掉
            else if (
                (v.type === '限价' && dic[PRICE].reduceOnly === true) ||
                (v.type === '限价只减仓' && dic[PRICE].reduceOnly === false)
            ) {
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