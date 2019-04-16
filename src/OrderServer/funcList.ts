import { BaseType } from '../lib/BaseType'

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

    任务: {
        req: {
            cookie: '',
            名字: '',
            开关: false,
            参数: '',
        },
        res: false,
    },
}
