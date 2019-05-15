import { BaseType } from '../lib/BaseType'

export const funcList = {

    //bitmex才需要服务器下单模式  重试很多遍
    //hopex代理就行了

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

    set_任务_开关: {
        req: {
            cookie: '',
            名字: '',
            开关: false,
        },
        res: false,
    },

    set_任务_参数: {
        req: {
            cookie: '',
            名字: '',
            参数: '',
        },
        res: false,
    },
}
