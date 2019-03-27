
import { to范围 } from './lib/F/to范围'
import { config } from './config'

export namespace XBTUSD摸顶抄底追涨追跌__参数 {

    export const 交易数量 = config.量化数量 || 2

    export const 推止损 = (p: { 波动率: number, 盈利点: number, type: '摸顶' | '抄底' | '追涨' | '追跌' | 'none' }) => {
        if (p.type === '追涨' || p.type === '追跌') {
            if (p.盈利点 >= 10) {
                return 5
            }
            else if (p.盈利点 >= 3) {
                return 0
            }
            else {
                return NaN
            }
        } else {
            if (p.盈利点 >= to范围({ min: 5, max: 30, value: p.波动率 / 5 + 15 })) {
                return 5
            }
            else if (p.盈利点 >= to范围({ min: 5, max: 15, value: p.波动率 / 8 + 6 })) {
                return 0
            }
            else {
                return NaN
            }
        }
    }
}