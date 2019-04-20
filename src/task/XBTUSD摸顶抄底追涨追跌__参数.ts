import { toRange } from '../lib/F/toRange'

export namespace XBTUSD摸顶抄底追涨追跌__参数 {    

    export const 初始止损 = (p: {
        波动率: number
    }) => toRange({
        min: 4,
        max: 18,
        value: p.波动率 / 10 + 4,
    })

    export const 推止损 = (p: {
        波动率: number
        盈利点: number
        type: '摸顶' | '抄底' | '追涨' | '追跌' | 'none'
    }) => {
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
        }
        else if (p.type === '摸顶' || p.type === '抄底') {
            if (p.盈利点 >= toRange({ min: 5, max: 30, value: p.波动率 / 5 + 15 })) {
                return 5
            }
            else if (p.盈利点 >= toRange({ min: 5, max: 15, value: p.波动率 / 8 + 6 })) {
                return 0
            }
            else {
                return NaN
            }
        }
        else {
            return NaN
        }
    }

}