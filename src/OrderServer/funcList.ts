import { BaseType } from '../lib/BaseType'

export const funcList = {

    下单和止损: {
        req: {
            cookie: '',
            symbol: '' as BaseType.BitmexSymbol,
            type: '' as 'taker' | 'maker',
            side: '' as BaseType.Side,
            size: 0,
            止损点: 0,
            延迟下单: [{
                现货: {
                    symbol: '' as BaseType.BinanceSymbol,
                    超时秒: 0,
                    偏移: 0,
                },
                期货: {
                    超时秒: 0,
                    偏移: 0,
                }
            }]
        },
        res: ''
    },

    市价平仓: {
        req: {
            cookie: '',
            symbol: '' as BaseType.BitmexSymbol
        },
        res: ''
    },

    取消全部委托: {
        req: {
            cookie: '',
            symbol: '' as BaseType.BitmexSymbol
        },
        res: ''
    }
}