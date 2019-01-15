import { BaseType } from '../lib/BaseType'
import { JSONSync } from '../lib/C/JSONSync'

export const funcList = {
    //TODO
    任务开关: {
        req: {
            cookie: '',
            symbol: '' as BaseType.BitmexSymbol,
            key: '' as '止盈' | '止损',
            isOpen: false,
        },
        res: false,
    },


    //TODO  止损 和 止盈(减仓)  不取消
    取消全部活动委托: {
        req: {
            cookie: '',
            symbol: '' as BaseType.BitmexSymbol,
        },
        res: false,
    },

    //
    市价平仓全部: {
        req: {
            cookie: '',
            symbol: '' as BaseType.BitmexSymbol,
        },
        res: false,
    },

    //挂单 吃单
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
}


const symbol = () => ({
    任务: {
        止损: false,
        止盈: false,
    },
    活动委托: [] as {
        type: '限价' | '限价只减仓' | '止损'
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