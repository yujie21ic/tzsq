import { 指标 } from './指标'
import { RealDataBase } from '../RealDataServer/RealDataBase'
import { BaseType } from '../lib/BaseType'
import { sum } from 'ramda'

const 买卖 = (p: {
    成交量: ArrayLike<number>
    盘口: ArrayLike<number>
    反向成交量: ArrayLike<number>
    反向盘口: ArrayLike<number>
}) => {

    const 净成交量 = 指标.map(() => Math.min(p.成交量.length, p.反向成交量.length), i => p.成交量[i] - p.反向成交量[i])
    const 净成交量乘以10 = 指标.map(() => Math.min(p.成交量.length, p.反向成交量.length), i => (p.成交量[i] - p.反向成交量[i])*10)
    const 净盘口 = 指标.map(() => Math.min(p.盘口.length, p.反向盘口.length), i => p.盘口[i] - p.反向盘口[i])
    const 成交量 = 指标.map(() => Math.min(p.成交量.length), i => p.成交量[i])
    return {
        //成交量
        成交量: p.成交量,
        成交量_累加5: 指标.累加(p.成交量, 5, RealDataBase.单位时间),

        //盘口
        盘口: p.盘口,
        成交量_累加60: 指标.累加(成交量, 60, RealDataBase.单位时间),
        //净成交量
        净成交量,
        净成交量_累加5: 指标.累加(净成交量, 5, RealDataBase.单位时间),
        净成交量_累加7: 指标.累加(净成交量, 7, RealDataBase.单位时间),
        净成交量_累加10: 指标.累加(净成交量, 10, RealDataBase.单位时间),
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
    const __成交量买 = 指标.map(() => data.length, i => data[i].buySize)
    const __成交量卖 = 指标.map(() => data.length, i => data[i].sellSize)
    const __盘口买 = 指标.map(() => orderBook.length, i => sum(orderBook[i].buy.map(v => v.size)))
    const __盘口卖 = 指标.map(() => orderBook.length, i => sum(orderBook[i].sell.map(v => v.size)))

    const 买 = 买卖({
        成交量: __成交量买,
        盘口: __盘口买,
        反向成交量: __成交量卖,
        反向盘口: __盘口卖,
    })

    const 卖 = 买卖({
        成交量: __成交量卖,
        盘口: __盘口卖,
        反向成交量: __成交量买,
        反向盘口: __盘口买,
    })

    return { 买, 卖 }
}
