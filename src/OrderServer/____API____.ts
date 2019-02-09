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

    自动交易_开关: {
        req: {
            cookie: '',
            symbol: '' as BaseType.BitmexSymbol,
            value: false,
        },
        res: false,
    },
}


const symbol = () => ({
    自动交易: false,
    活动委托: [] as {
        type: '限价' | '限价只减仓' | '止损' | '市价触发'
        id: string
        side: BaseType.Side
        cumQty: number      //成交数量
        orderQty: number    //委托数量
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