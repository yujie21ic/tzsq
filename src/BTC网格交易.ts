import { BaseType } from './lib/BaseType'
import { to价格对齐 } from './lib/F/to价格对齐'
import { range } from 'ramda'
import { PositionAndOrder } from './lib/____API____/PositionAndOrder/PositionAndOrder'
import { PositionAndOrderTask } from './lib/____API____/PositionAndOrder/PositionAndOrder'
import { lastNumber } from './lib/F/lastNumber'
import { BTC网格交易__参数 } from './BTC网格交易__参数'

export class BTC网格交易 implements PositionAndOrderTask {

    self = {} as PositionAndOrder
    lastFillSide = '' as BaseType.Side
    lastFillPrice = NaN
    lastFillTime = 0

    get仓位数量 = () => this.self.jsonSync.rawData.market.bitmex.XBTUSD.仓位数量

    get开仓均价 = () => this.self.jsonSync.rawData.market.bitmex.XBTUSD.开仓均价 || lastNumber(this.self.realData.dataExt.XBTUSD.bitmex.买.盘口1价)

    getBuy1 = () => lastNumber(this.self.realData.dataExt.XBTUSD.bitmex.买.盘口1价)

    getSell1 = () => lastNumber(this.self.realData.dataExt.XBTUSD.bitmex.卖.盘口1价)

    __getPrice = (side: BaseType.Side, _price_?: number, 必须盈利 = true) => {
        if (side === 'Buy') {
            const arr = [_price_, this.getSell1(), ...[必须盈利 ? [this.get开仓均价()] : []]].filter(v => v !== 0 && v !== undefined) as number[]
            let price = Math.min(...arr)

            //多仓.最大价格 删除
            return to价格对齐({
                side: 'Buy',
                value: price,
                grid: BTC网格交易__参数.单个格子大小
            })
        } else {
            const arr = [_price_, this.getBuy1(), ...[必须盈利 ? [this.get开仓均价()] : []]].filter(v => v !== 0 && v !== undefined) as number[]
            let price = Math.max(...arr)

            //空仓.最小价格 删除
            return to价格对齐({
                side: 'Sell',
                value: price,
                grid: BTC网格交易__参数.单个格子大小
            })
        }
    }

    getPrice = (side: BaseType.Side, 必须盈利: boolean) => {
        let p = this.__getPrice(side, undefined, 必须盈利)

        //重挂时间内
        if (this.lastFillSide === side &&
            (
                (side === 'Buy' && p >= this.lastFillPrice) ||
                (side === 'Sell' && p <= this.lastFillPrice)
            ) &&
            Date.now() < this.lastFillTime + BTC网格交易__参数.重挂时间ms
        ) {
            p = this.__getPrice(side, this.lastFillPrice, 必须盈利)
        }

        return p
    }

    getOrderArr = (side: BaseType.Side) => {
        let p = this.getPrice(side, true)

        //多仓小于min 盈利加仓
        if (side === 'Buy' && this.get仓位数量() > 0 && this.get仓位数量() < BTC网格交易__参数.多仓.min) {
            p = this.getPrice('Buy', false)
        }

        //空仓小于min 盈利加仓 
        if (side === 'Sell' && this.get仓位数量() < 0 && Math.abs(this.get仓位数量()) < BTC网格交易__参数.空仓.min) {
            p = this.getPrice('Sell', false)
        }

        return range(0, BTC网格交易__参数.格数).map(i =>
            ({
                side,
                price: side === 'Buy' ? p - i * BTC网格交易__参数.单个格子大小 : p + i * BTC网格交易__参数.单个格子大小,
                count: BTC网格交易__参数.单个格子数量
            })
        )
    }

    //price 不能重复
    sync活动委托 = (arr: { side: BaseType.Side, price: number, count: number }[]) => {

        let dic: { [price: number]: { side: BaseType.Side, count: number } } = {}

        arr.forEach(v => {
            dic[v.price] = { side: v.side, count: v.count }
        })

        let cancelIDs: string[] = []

        this.self.jsonSync.rawData.market.bitmex.XBTUSD.委托列表.forEach(v => {
            const PRICE = v.price

            //这个价格没有委托 取消掉
            if (dic[PRICE] === undefined) {
                cancelIDs.push(v.id)
            }
            // 委托数量不一样 取消掉
            else if (v.orderQty !== dic[PRICE].count) {
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
            let arr: { side: BaseType.Side, price: number, size: number }[] = []
            for (const price in dic) {
                arr.push({
                    side: dic[price].side,
                    price: Number(price),
                    size: dic[price].count,
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

    onFilled(p: {
        symbol: BaseType.BitmexSymbol
        side: BaseType.Side
        price: number
        size: number
        type: '限价' | '限价只减仓' | '止损' | '强平'
    }) {
        console.log('onFilled', JSON.stringify(p))
        if (p.symbol === 'XBTUSD') {
            this.lastFillSide = p.side
            this.lastFillPrice = p.side === 'Buy' ? p.price - 0.5 : p.price + 0.5//>---------------------
            this.lastFillTime = Date.now()
        }
    }

    onHopexTick(self: PositionAndOrder) {
        return false
    }

    onTick(self: PositionAndOrder) {

        this.self = self

        const 减仓 = this.getOrderArr(this.get仓位数量() > 0 ? 'Sell' : 'Buy')

        const 加仓 = this.getOrderArr(this.get仓位数量() > 0 ? 'Buy' : 'Sell')


        let arr: { side: BaseType.Side, price: number, count: number }[] = []

        let count = 0
        let temp = false
        for (let i = 0; i < 减仓.length; i++) {
            count += 减仓[i].count
            //没有仓位 Buy
            if (this.get仓位数量() === 0) {
                if (count > BTC网格交易__参数.多仓.max) break
            }
            //多仓
            if (this.get仓位数量() > 0) {
                //不能减仓
                if (BTC网格交易__参数.多仓.min !== 0 && this.get仓位数量() < BTC网格交易__参数.多仓.min) {
                    break
                }

                //减仓后不能 反手 > 最大仓位
                if (this.get仓位数量() - count < -BTC网格交易__参数.空仓.max) {
                    break
                }

                //减仓后 < 最小仓位 下一格就不减仓了
                if (BTC网格交易__参数.多仓.min !== 0 && this.get仓位数量() - count < BTC网格交易__参数.多仓.min) {
                    temp = true
                }
            }
            //空仓
            if (this.get仓位数量() < 0) {
                //不能减仓
                if (BTC网格交易__参数.空仓.min !== 0 && this.get仓位数量() > -BTC网格交易__参数.空仓.min) {
                    break
                }

                //减仓后不能 反手 > 最大仓位
                if (this.get仓位数量() + count > BTC网格交易__参数.多仓.max) {
                    break
                }

                //减仓后 < 最小仓位 下一格就不减仓了
                if (BTC网格交易__参数.空仓.min !== 0 && this.get仓位数量() + count > -BTC网格交易__参数.空仓.min) {
                    temp = true
                }
            }
            arr.push(减仓[i])
            if (temp) break
        }


        count = 0
        for (let i = 0; i < 加仓.length; i++) {
            count += 加仓[i].count
            //没有仓位 Sell
            if (this.get仓位数量() === 0) {
                if (count > BTC网格交易__参数.空仓.max) break
            }
            //多仓
            if (this.get仓位数量() > 0) {
                //加仓后不能 > 最大仓位
                if (this.get仓位数量() + count > BTC网格交易__参数.多仓.max) {
                    break
                }
            }
            //空仓
            if (this.get仓位数量() < 0) {
                //加仓后不能 > 最大仓位
                if (this.get仓位数量() - count < -BTC网格交易__参数.空仓.max) {
                    break
                }
            }
            arr.push(加仓[i])
        }

        return this.sync活动委托(arr)
    }
}