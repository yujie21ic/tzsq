import { BaseType } from '../lib/BaseType'

export const funcList = {
    //K线
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
}