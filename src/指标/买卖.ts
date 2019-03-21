import { 指标 } from './指标'
import { RealDataBase } from '../RealDataServer/RealDataBase'

export const 买卖 = (p: { 成交量: ArrayLike<number>, 盘口: ArrayLike<number>, 反向成交量: ArrayLike<number>, 反向盘口: ArrayLike<number> }) => {

    const 净成交量 = 指标.lazyMapCache(() => Math.min(p.成交量.length, p.反向成交量.length), i => p.成交量[i] - p.反向成交量[i])
    const 净盘口 = 指标.lazyMapCache(() => Math.min(p.盘口.length, p.反向盘口.length), i => p.盘口[i] - p.反向盘口[i])
    const 净成交量_累加5 = 指标.累加(净成交量, 5, RealDataBase.单位时间)
    const 净成交量_累加10 = 指标.累加(净成交量, 10, RealDataBase.单位时间)
    const 净成交量_累加7 = 指标.累加(净成交量, 7, RealDataBase.单位时间)
    const 净成交量_累加60 = 指标.累加(净成交量, 60, RealDataBase.单位时间)
    const 净成交量_累加500 = 指标.累加(净成交量, 500, RealDataBase.单位时间)
    const 净成交量_累加temp = 指标.累加(净成交量, 3600, RealDataBase.单位时间)

    return {
        成交量: p.成交量,
        盘口: p.盘口,
        成交量_累加5: 指标.累加(p.成交量, 5, RealDataBase.单位时间),
        //盘口_均线_1d5: 指标.均线(p.盘口, 1.5, RealDataBase.单位时间),
        净成交量,
        净成交量_累加5,
        净成交量_累加7,
        净成交量_累加10,
        净成交量_累加60,
        净成交量_累加500,
        净成交量_累加temp,
        净盘口,
        净盘口_均线3: 指标.均线(净盘口, 3, RealDataBase.单位时间),
        //is趋势: 指标.lazyMapCache(() => Math.min(净成交量_累加60.length), i => 净成交量_累加60[i] >= 0),//买是上涨  卖是下跌
    }
}