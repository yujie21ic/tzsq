import { BaseType } from '../lib/BaseType'
import { JSONSync } from '../lib/C/JSONSync'

export const funcList = {

    取消委托: {
        req: {
            cookie: '',
            orderID: [''],
        },
        res: false,
    },

    市价平仓: {
        req: {
            cookie: '',
            symbol: '' as BaseType.BitmexSymbol,
        },
        res: false,
    },

    下单: {
        req: {
            cookie: '',
            symbol: '' as BaseType.BitmexSymbol,
            type: '' as 'taker' | 'maker',
            side: '' as BaseType.Side,
            size: 0,
            位置: 0,
            最低_最高: false,
        },
        res: false,
    },

    任务_开关: {
        req: {
            cookie: '',
            symbol: '' as BaseType.BitmexSymbol,
            任务名字: '' as '自动开仓摸顶' | '自动开仓抄底' | '自动开仓追涨' | '自动开仓追跌' | '自动止盈' | '自动止盈波段' | '自动推止损',
            value: false,
        },
        res: false,
    },
}