import { 指标 } from './指标'
import { RealDataBase } from '../RealDataServer/RealDataBase'

export const 买卖 = (p: { 成交量: ArrayLike<number>, 盘口: ArrayLike<number>, 反向成交量: ArrayLike<number>, 反向盘口: ArrayLike<number> }) => {

    const 净成交量 = 指标.lazyMapCache(() => Math.min(p.成交量.length, p.反向成交量.length), i => p.成交量[i] - p.反向成交量[i])
    const 净盘口 = 指标.lazyMapCache(() => Math.min(p.盘口.length, p.反向盘口.length), i => p.盘口[i] - p.反向盘口[i])

    return {
        //成交量
        成交量: p.成交量,
        成交量_累加5: 指标.累加(p.成交量, 5, RealDataBase.单位时间),

        //盘口
        盘口: p.盘口,

        //净成交量
        净成交量,
        净成交量_累加5: 指标.累加(净成交量, 5, RealDataBase.单位时间),
        净成交量_累加7: 指标.累加(净成交量, 7, RealDataBase.单位时间),
        净成交量_累加10: 指标.累加(净成交量, 10, RealDataBase.单位时间),
        净成交量_累加60: 指标.累加(净成交量, 60, RealDataBase.单位时间),
        净成交量_累加500: 指标.累加(净成交量, 500, RealDataBase.单位时间),
        净成交量_累加temp: 指标.累加(净成交量, 3600, RealDataBase.单位时间),

        //净盘口
        净盘口,
        净盘口_均线3: 指标.均线(净盘口, 3, RealDataBase.单位时间),
    }
}