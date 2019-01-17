import { BaseType } from '../lib/BaseType'
import { JSONSync } from '../lib/C/JSONSync'

export const funcList = {

    //参数设置  分开设置了
    set_任务_止盈: {
        req: {
            cookie: '',
            symbol: '' as BaseType.BitmexSymbol,
            value: false,
        },
        res: false,
    },

    set_任务_止盈第一次平到多少仓位: {
        req: {
            cookie: '',
            symbol: '' as BaseType.BitmexSymbol,
            value: 0,
        },
        res: false,
    },

    set_任务_止损: {
        req: {
            cookie: '',
            symbol: '' as BaseType.BitmexSymbol,
            value: false,
        },
        res: false,
    },


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
        },
        res: false,
    },

    下单_最低_最高: {
        req: {
            cookie: '',
            symbol: '' as BaseType.BitmexSymbol,
            type: '' as 'taker' | 'maker',
            side: '' as BaseType.Side,
            size: 0,
        },
        res: false,
    },
}


const symbol = () => ({
    任务: {
        止损: false,
        止盈: false,
        止盈第一次平到多少仓位: 0,
    },
    活动委托: [] as {
        type: '限价' | '限价只减仓' | '止损' | '市价触发'
        id: string
        side: BaseType.Side
        size: number
        price: number
    }[],
    仓位数量: 0,
    开仓均价: 0,
})

export const createJSONSync = () =>
    new JSONSync(
        {
            //资金曲线
            wallet: [] as {
                time: number
                total: number
            }[],
            //
            symbol: {
                XBTUSD: symbol(),
                ETHUSD: symbol(),
            }
        }
    )