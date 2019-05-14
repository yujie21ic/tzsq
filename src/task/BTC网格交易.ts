import { BaseType } from '../lib/BaseType'
import { range } from 'ramda'
import { PositionAndOrder } from '../OrderServer/PositionAndOrder'
import { PositionAndOrderTask } from '../OrderServer/PositionAndOrder'
import { to价格对齐 } from '../lib/F/to价格对齐'
import { sleep } from '../lib/F/sleep'
import { typeObjectParse } from '../lib/F/typeObjectParse'

const 参数type = {
    网格大小: 0.5,
    单位数量: 25,
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

export class BTC网格交易 implements PositionAndOrderTask {

    开关 = false
    参数type = 参数type
    参数 = typeObjectParse(参数type)({})

    private self = {} as PositionAndOrder
    private lastBuyPrice = NaN
    private lastSellPrice = NaN

    private get仓位数量 = () => this.self.jsonSync.rawData.market.bitmex.XBTUSD.仓位数量

    private get强平价格 = () => this.self.jsonSync.rawData.market.bitmex.XBTUSD.强平价格

    private getBuy1 = () => this.self.miniRealData.getBuy1Price('XBTUSD')

    private getSell1 = () => this.self.miniRealData.getSell1Price('XBTUSD')

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

    private toList = ({ side, price }: { side: BaseType.Side, price: number }) =>
        range(0, 50).map(i =>
            ({
                side,
                price: side === 'Buy' ? price - i * this.参数.网格大小 : price + i * this.参数.网格大小,
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

    private 同一个价位不连续挂2次 = (v: { side: BaseType.Side, price: number }) =>
        (v.side === 'Buy' && v.price !== this.lastBuyPrice) || (v.side === 'Sell' && v.price !== this.lastSellPrice)


    private 止损task = () => {
        const { self } = this
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
        return false
    }

    private 方向一致 = () => (this.参数.方向 === 'Buy' && this.get仓位数量() >= 0) || (this.参数.方向 === 'Sell' && this.get仓位数量() <= 0)

    private 加仓task = () =>
        this.sync委托列表({
            reduceOnly: false,
            side: this.参数.方向,
            剩余: Math.max(0, this.方向一致() ?
                this.参数.最大仓位 - Math.abs(this.get仓位数量()) : //方向一致
                this.参数.最大仓位 + Math.abs(this.get仓位数量())   //方向不一致
            ),
            arr: this.get加仓()
        })

    private 减仓task = () =>
        this.sync委托列表({
            reduceOnly: true,
            side: this.参数.方向 === 'Buy' ? 'Sell' : 'Buy',
            剩余: Math.max(0, (Math.abs(this.get仓位数量()) - this.参数.留多少不减仓)),
            arr: this.get减仓()
        })

    private async run1(self: PositionAndOrder, f: () => boolean | Promise<boolean>) {
        while (true) {
            if (this.开关 && self.bitmex_初始化.仓位 && self.bitmex_初始化.委托 && this.self.get本地维护仓位数量('XBTUSD') === this.self.jsonSync.rawData.market.bitmex.XBTUSD.仓位数量) {
                await f()
            }
            await sleep(0)
        }
    }

    run(self: PositionAndOrder) {
        this.self = self
        this.run1(self, this.止损task)
        this.run1(self, this.加仓task)
        this.run1(self, this.减仓task)
    }

    private get减仓() {
        if (this.参数.减仓 === false) return []

        const count = this.get仓位数量()
        if (this.参数.方向 === 'Buy' && count > 0) {
            return this.toList({
                side: 'Sell',
                price: to价格对齐({
                    side: 'Sell',
                    value: this.参数.亏损减仓 ? this.getSell1() : this.sellPrice(this.参数.最小盈利点),
                    grid: this.参数.网格大小,
                }),
            }).filter(this.同一个价位不连续挂2次).slice(0, this.参数.格数)
        }
        else if (this.参数.方向 === 'Sell' && count < 0) {
            return this.toList({
                side: 'Buy',
                price: to价格对齐({
                    side: 'Buy',
                    value: this.参数.亏损减仓 ? this.getBuy1() : this.buyPrice(this.参数.最小盈利点),
                    grid: this.参数.网格大小,
                }),
            }).filter(this.同一个价位不连续挂2次).slice(0, this.参数.格数)
        } else {
            return []
        }
    }


    private get加仓() {
        if (this.参数.加仓 === false) return []
        return this.toList({
            side: this.参数.方向,
            price: to价格对齐({
                side: this.参数.方向,
                value: this.参数.方向 === 'Sell' ?
                    (this.参数.盈利加仓 ? this.getSell1() : this.sellPrice()) :
                    (this.参数.盈利加仓 ? this.getBuy1() : this.buyPrice()),
                grid: this.参数.网格大小,
            }),
        }).filter(this.同一个价位不连续挂2次).filter(v =>
            this.方向一致() === false ? true :
                this.参数.止损价格 === 0 ?
                    (
                        this.get强平价格() === 0 ? true :
                            this.参数.方向 === 'Buy' ?
                                v.price > this.get强平价格() :
                                v.price < this.get强平价格()
                    )
                    :
                    this.参数.方向 === 'Buy' ?
                        v.price > Math.max(this.参数.止损价格, this.get强平价格()) :
                        v.price < Math.min(this.参数.止损价格, this.get强平价格())
        ).slice(0, this.参数.格数)
    }



    private sync委托列表({ reduceOnly, 剩余, side, arr }: { reduceOnly: boolean, 剩余: number, side: BaseType.Side, arr: { price: number }[] }) {

        const 当前委托 = this.self.jsonSync.rawData.market.bitmex.XBTUSD.委托列表
            .filter(v => v.type === (reduceOnly ? '限价只减仓' : '限价'))
            .sort((a, b) => side === 'Sell' ? a.price - b.price : b.price - a.price)


        //side不对的委托 先取消掉
        const side不对的委托 = 当前委托.filter(v => v.side !== side)
        if (side不对的委托.length !== 0) {
            return this.self.cancel({ orderID: side不对的委托.map(v => v.id) })
        }


        剩余 += 当前委托.length > 0 ? 当前委托[0].cumQty : 0 //部分成交加到剩余里面        
        const xxx: { price: number, size: number }[] = [] //计算出同步委托列表
        let i = 0
        while (剩余 > 0 && i < arr.length) {
            const size = 剩余 >= this.参数.单位数量 ? this.参数.单位数量 : 剩余
            xxx.push({
                price: arr[i].price,
                size,
            })
            剩余 -= size
            i++
        }

        return this.sync委托列表__2({ reduceOnly, side, arr: xxx })
    }


    private sync委托列表__2({ reduceOnly, side, arr }: { reduceOnly: boolean, side: BaseType.Side, arr: { price: number, size: number }[] }) {

        //TODO 取消 挂上 改成  修改

        //price 不能重复
        let dic: { [price: number]: { size: number } } = {}

        arr.forEach(v => dic[v.price] = { size: v.size })

        let cancelIDs: string[] = []

        this.self.jsonSync.rawData.market.bitmex.XBTUSD.委托列表.filter(v => v.type === (reduceOnly ? '限价只减仓' : '限价')).forEach(v => {
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
                    side,
                    price: Number(price),
                    size: dic[price].size,
                    reduceOnly,
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