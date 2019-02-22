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
            任务名字: '' as '自动开仓' | '自动止盈' | '自动推止损',
            value: false,
        },
        res: false,
    },
}


const symbol = () => ({
    任务开关: {
        自动开仓: {
            value: false,
            text: '',
        },
        自动止盈: {
            value: false,
            text: '',
        },
        自动推止损: {
            value: true,
            text: '',
        }
    },

    委托: {
        id: '',
        side: '' as BaseType.Side,
        cumQty: 0,      //成交数量
        orderQty: 0,    //委托数量
        price: 0,
    },
    止损价格: 0,
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