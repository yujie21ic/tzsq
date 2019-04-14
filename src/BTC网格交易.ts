import { BaseType } from './lib/BaseType'
import { to价格对齐 } from './lib/F/to价格对齐'
import { range } from 'ramda'

type AAAA = {
    get单个格子大小: (n: number) => number          //n是距离   没算累计
    get单个格子数量: (n: number) => number          //n是仓位数量 算了累计

    格数: number
    重挂时间: number

    buy条件: (p: {
        仓位数量: number
        价格: number
        开仓均价: number
    }) => boolean

    sell条件: (p: {
        仓位数量: number
        价格: number
        开仓均价: number
    }) => boolean
}

type 参数 = {
    加仓: AAAA
    减仓: AAAA
    多仓: {
        min: number
        max: number
    }
    空仓: {
        min: number
        max: number
    }
}


let 网格配置: 参数



import { PositionAndOrder } from './lib/____API____/PositionAndOrder/PositionAndOrder'
import { PositionAndOrderTask } from './lib/____API____/PositionAndOrder/PositionAndOrder'
import { lastNumber } from './lib/F/lastNumber'

export class BTC网格交易 implements PositionAndOrderTask {

    self = {} as PositionAndOrder
    lastFillSide = '' as BaseType.Side
    lastFillPrice = NaN
    lastFillTime = 0


    get加仓数量 = (累计: number) => 网格配置.加仓.get单个格子数量(累计 + Math.abs(this.get仓位数量()))

    get减仓数量 = (累计: number) => 网格配置.减仓.get单个格子数量(累计 + Math.abs(this.get仓位数量()))

    get仓位数量 = () => this.self.jsonSync.rawData.market.bitmex.XBTUSD.仓位数量

    get开仓均价 = () => this.self.jsonSync.rawData.market.bitmex.XBTUSD.开仓均价

    getBuy1 = () => lastNumber(this.self.realData.dataExt.XBTUSD.bitmex.买.盘口1价)

    getSell1 = () => lastNumber(this.self.realData.dataExt.XBTUSD.bitmex.卖.盘口1价)


    __getPrice = (side: BaseType.Side, 网格点: number, _price_?: number, 必须盈利 = true) => {
        // console.log(side, '必须盈利', 必须盈利)
        if (side === 'Buy') {
            const arr = [_price_, this.getSell1(), ...[必须盈利 ? [this.get开仓均价()] : []]].filter(v => v !== 0 && v !== undefined) as number[]
            let price = Math.min(...arr)

            //多仓.最大价格 删除

            return to价格对齐({
                side: 'Buy',
                value: price,
                grid: 网格点
            })
        } else {
            const arr = [_price_, this.getBuy1(), ...[必须盈利 ? [this.get开仓均价()] : []]].filter(v => v !== 0 && v !== undefined) as number[]
            let price = Math.max(...arr)

            //空仓.最小价格 删除

            return to价格对齐({
                side: 'Sell',
                value: price,
                grid: 网格点
            })
        }
    }

    getPrice = (side: BaseType.Side, 网格点: number, 重挂时间: number, 必须盈利: boolean) => {
        let p = this.__getPrice(side, 网格点, undefined, 必须盈利)

        //重挂时间内
        if (this.lastFillSide === side &&
            (
                (side === 'Buy' && p >= this.lastFillPrice) ||
                (side === 'Sell' && p <= this.lastFillPrice)
            ) &&
            Date.now() < this.lastFillTime + 重挂时间 * 1000
        ) {
            p = this.__getPrice(side, 网格点, this.lastFillPrice, 必须盈利)
        }

        return p
    }

    getOrderArr = (side: BaseType.Side, 网格点: number, 格数: number, 重挂时间: number) => {
        let p = this.getPrice(side, 网格点, 重挂时间, true)

        //多仓小于min 亏损加仓
        if (side === 'Buy' && this.get仓位数量() > 0 && this.get仓位数量() < 网格配置.多仓.min) {
            p = this.getPrice('Buy', 网格点, 重挂时间, false)
        }

        //空仓小于min 亏损加仓 
        if (side === 'Sell' && this.get仓位数量() < 0 && Math.abs(this.get仓位数量()) < 网格配置.空仓.min) {
            p = this.getPrice('Sell', 网格点, 重挂时间, false)
        }

        let 累计 = 0
        return range(0, 格数).map(i => {
            const price = side === 'Buy' ? p - i * 网格点 : p + i * 网格点
            let count: number
            if (side === 'Buy') {
                count = this.get仓位数量() > 0 ? this.get加仓数量(累计) : this.get减仓数量(累计)
            } else {
                count = this.get仓位数量() < 0 ? this.get加仓数量(累计) : this.get减仓数量(累计)
            }
            累计 += count
            return { side, price, count }
        })
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
            api.orderCancel(cancelIDs)
        } else {
            let arr: { side: BaseType.Side, price: number, count: number }[] = []
            for (const price in dic) {
                arr.push({
                    side: dic[price].side,
                    price: Number(price),
                    count: dic[price].count,
                })
            }
            api.order(arr)
        }
    }



    onFilled(p: { symbol: BaseType.BitmexSymbol, type: '限价' | '限价只减仓' | '止损' | '强平' }) {

    }

    onHopexTick(self: PositionAndOrder) {
        return false
    }


    onTick(self: PositionAndOrder) {
        const 减仓距离 = this.get开仓均价() === 0 ? 0 : Math.abs(this.get开仓均价() - (this.get仓位数量() > 0 ? this.getSell1() : this.getBuy1()))
        const 减仓 = this.getOrderArr(
            this.get仓位数量() > 0 ? 'Sell' : 'Buy',
            网格配置.减仓.get单个格子大小(减仓距离),
            网格配置.减仓.格数,
            网格配置.减仓.重挂时间
        ).filter(v => v.side === 'Buy' ? 网格配置.减仓.buy条件({
            仓位数量: this.get仓位数量(),
            价格: v.price,
            开仓均价: this.get开仓均价()
        }) : 网格配置.减仓.sell条件({
            仓位数量: this.get仓位数量(),
            价格: v.price,
            开仓均价: this.get开仓均价()
        }))

        const 加仓距离 = this.get开仓均价() === 0 ? 0 : Math.abs(this.get开仓均价() - (this.get仓位数量() > 0 ? this.getBuy1() : this.getSell1()))
        const 加仓 = this.getOrderArr(
            this.get仓位数量() > 0 ? 'Buy' : 'Sell',
            网格配置.加仓.get单个格子大小(加仓距离),
            网格配置.加仓.格数,
            网格配置.加仓.重挂时间
        ).filter(v => v.side === 'Buy' ? 网格配置.加仓.buy条件({
            仓位数量: this.get仓位数量(),
            价格: v.price,
            开仓均价: this.get开仓均价()
        }) : 网格配置.加仓.sell条件({
            仓位数量: this.get仓位数量(),
            价格: v.price,
            开仓均价: this.get开仓均价()
        }))

        let arr: { side: BaseType.Side, price: number, count: number }[] = []

        let count = 0
        let temp = false
        for (let i = 0; i < 减仓.length; i++) {
            count += 减仓[i].count
            //没有仓位 Buy
            if (this.get仓位数量() === 0) {
                if (count > 网格配置.多仓.max) break
            }
            //多仓
            if (this.get仓位数量() > 0) {
                //不能减仓
                if (网格配置.多仓.min !== 0 && this.get仓位数量() < 网格配置.多仓.min) {
                    break
                }

                //减仓后不能 反手 > 最大仓位
                if (this.get仓位数量() - count < -网格配置.空仓.max) {
                    break
                }

                //减仓后 < 最小仓位 下一格就不减仓了
                if (网格配置.多仓.min !== 0 && this.get仓位数量() - count < 网格配置.多仓.min) {
                    temp = true
                }
            }
            //空仓
            if (this.get仓位数量() < 0) {
                //不能减仓
                if (网格配置.空仓.min !== 0 && this.get仓位数量() > -网格配置.空仓.min) {
                    break
                }

                //减仓后不能 反手 > 最大仓位
                if (this.get仓位数量() + count > 网格配置.多仓.max) {
                    break
                }

                //减仓后 < 最小仓位 下一格就不减仓了
                if (网格配置.空仓.min !== 0 && this.get仓位数量() + count > -网格配置.空仓.min) {
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
                if (count > 网格配置.空仓.max) break
            }
            //多仓
            if (this.get仓位数量() > 0) {
                //加仓后不能 > 最大仓位
                if (this.get仓位数量() + count > 网格配置.多仓.max) {
                    break
                }
            }
            //空仓
            if (this.get仓位数量() < 0) {
                //加仓后不能 > 最大仓位
                if (this.get仓位数量() - count < -网格配置.空仓.max) {
                    break
                }
            }
            arr.push(加仓[i])
        }
        // console.log(JSON.stringify(arr))
        this.sync活动委托(arr)
        return true
    }


}