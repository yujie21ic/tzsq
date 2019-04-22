import { 指标 } from './指标'
import { RealDataBase } from '../RealDataServer/RealDataBase'
import { BaseType } from '../lib/BaseType'
import { sum } from 'ramda'

const 买卖 = (p: {
    成交量: ArrayLike<number>
    盘口: ArrayLike<number>
    盘口1: ArrayLike<number>
    盘口1价: ArrayLike<number>
    反向成交量: ArrayLike<number>
    反向盘口: ArrayLike<number>
    反向盘口1价: ArrayLike<number>
    反向盘口1: ArrayLike<number>
}) => {

    const 净成交量 = 指标.map(() => Math.min(p.成交量.length, p.反向成交量.length), i => p.成交量[i] - p.反向成交量[i])
    const 净成交量乘以10 = 指标.map(() => Math.min(p.成交量.length, p.反向成交量.length), i => (p.成交量[i] - p.反向成交量[i]) * 10)
    const 净盘口 = 指标.map(() => Math.min(p.盘口.length, p.反向盘口.length), i => p.盘口[i] - p.反向盘口[i])
    const 成交量 = 指标.map(() => Math.min(p.成交量.length), i => p.成交量[i])
    const 反向成交量 = 指标.map(() => Math.min(p.成交量.length), i => p.反向成交量[i])

    return {
        //成交量
        成交量: p.成交量,
        成交量_累加5: 指标.累加(p.成交量, 5, RealDataBase.单位时间),

        //盘口
        盘口: p.盘口,
        盘口1: p.盘口1,
        盘口1价: p.盘口1价,
        成交量_累加60: 指标.累加(成交量, 60, RealDataBase.单位时间),

        买成交量累加: 指标.累加(成交量, 120, RealDataBase.单位时间),
        卖成交量累加: 指标.累加(反向成交量, 120, RealDataBase.单位时间),
        //净成交量
        净成交量,
        净成交量_累加5: 指标.累加(净成交量, 5, RealDataBase.单位时间),
        净成交量_累加7: 指标.累加(净成交量, 7, RealDataBase.单位时间),
        净成交量_累加10: 指标.累加(净成交量, 10, RealDataBase.单位时间),
        净成交量_累加12: 指标.累加(净成交量, 12, RealDataBase.单位时间),
        净成交量_累加60: 指标.累加(净成交量, 60, RealDataBase.单位时间),
        净成交量_累加60乘以10: 指标.累加(净成交量乘以10, 60, RealDataBase.单位时间),
        净成交量_累加500: 指标.累加(净成交量, 500, RealDataBase.单位时间),
        净成交量_累加temp: 指标.累加(净成交量, 3600, RealDataBase.单位时间),

        //净盘口
        净盘口,
        净盘口_均线3: 指标.SMA(净盘口, 3, RealDataBase.单位时间),
    }
}

export const get买卖 = ({ data, orderBook }: {
    data: BaseType.KLine[]
    orderBook: BaseType.OrderBook[]
}) => {
    const 成交量买 = 指标.map(() => data.length, i => data[i].buySize)
    const 成交量卖 = 指标.map(() => data.length, i => data[i].sellSize)

    const 盘口买 = 指标.map(() => orderBook.length, i => sum(orderBook[i].buy.map(v => v.size)))
    const 盘口卖 = 指标.map(() => orderBook.length, i => sum(orderBook[i].sell.map(v => v.size)))

    const 盘口买1 = 指标.map(() => orderBook.length, i => orderBook[i].buy.length > 0 ? orderBook[i].buy[0].size : NaN)
    const 盘口卖1 = 指标.map(() => orderBook.length, i => orderBook[i].sell.length > 0 ? orderBook[i].sell[0].size : NaN)

    const 盘口买1价 = 指标.map(() => orderBook.length, i => orderBook[i].buy.length > 0 ? orderBook[i].buy[0].price : NaN)
    const 盘口卖1价 = 指标.map(() => orderBook.length, i => orderBook[i].sell.length > 0 ? orderBook[i].sell[0].price : NaN)

    const 买 = 买卖({
        成交量: 成交量买,
        盘口: 盘口买,
        盘口1: 盘口买1,
        盘口1价: 盘口买1价,
        反向成交量: 成交量卖,
        反向盘口: 盘口卖,
        反向盘口1价: 盘口卖1价,
        反向盘口1: 盘口卖1,
    })

    const 卖 = 买卖({
        成交量: 成交量卖,
        盘口: 盘口卖,
        盘口1: 盘口卖1,
        盘口1价: 盘口卖1价,
        反向成交量: 成交量买,
        反向盘口: 盘口买,
        反向盘口1价: 盘口买1价,
        反向盘口1: 盘口买1,
    })

    return { 买, 卖 }
}
