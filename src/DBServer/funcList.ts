import { BaseType } from '../lib/BaseType'

export const funcList = {

    //现货没有500ms
    getKLine: {
        req: {
            type: '' as '1m' | '500ms',
            symbol: '' as BaseType.BitmexSymbol | BaseType.BinanceSymbol,
            startTime: 1,
            endTime: 1,
        },
        res: [{
            id: 0,
            open: 0,
            high: 0,
            low: 0,
            close: 0,
            buySize: 0,
            sellSize: 0,
            buyCount: 0,
            sellCount: 0
        }]
    },

    //现货 直接采集着笔
    getBinanceTick: {
        req: {
            symbol: '' as BaseType.BinanceSymbol,
            startTime: 0,
            endTime: 0
        },
        res: [{
            id: 0,
            timestamp: 0,
            price: 0,
            size: 0, //主动买是正  主动卖是负
        }]
    },

    //期货才有盘口
    getBitmex500msOrderBook: {
        req: {
            symbol: '' as BaseType.BitmexSymbol,
            startTime: 0,
            endTime: 0
        },
        res: [{
            id: 0,
            buy: [{
                price: 0,
                size: 0,
            }],
            sell: [{
                price: 0,
                size: 0,
            }],
        }]
    }
}