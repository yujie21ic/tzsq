import { Sampling } from '../F/Sampling'
import { BaseType } from '../BaseType'
import { DB } from './DB'
import { timeID } from '../F/timeID'
import { HopexTradeAndOrderBook } from '../../RealDataServer/TradeAndOrderBook/HopexTradeAndOrderBook'

//重复
let samplingDic: { [symbol: string]: Sampling<BaseType.KLine> }
let ws = new HopexTradeAndOrderBook('trade')

export const syncHopex500msKLine = async () => {

    ws.statusObservable.subscribe(v => {
        samplingDic = Object.create(null)
        console.log(new Date().toLocaleString(), 'syncHopex500msKLine isConnected ', v.isConnected)
    })

    ws.tradeObservable.subscribe(v => {
        const { symbol, timestamp } = v

        if (samplingDic[symbol] === undefined) {
            samplingDic[symbol] = new Sampling<BaseType.KLine>({
                open: '开',
                high: '高',
                low: '低',
                close: '收',
                buySize: '累加',
                sellSize: '累加',
                buyCount: '累加',
                sellCount: '累加',
            })

            const table = DB.getKLine('500ms', symbol as BaseType.HopexSymbol)

            //创建表
            table.sync()

            samplingDic[symbol].onComplete2 = item => {
                try {
                    table.create(item)
                } catch (error) {
                    console.log(`syncHopex500msKLine id:${item.id} 写入失败 error:${error}`)
                }
            }
        }

        samplingDic[symbol].in2({
            id: timeID._500ms.toID(timestamp),
            open: v.price,
            high: v.price,
            low: v.price,
            close: v.price,
            buySize: v.side === 'Buy' ? v.size : 0,
            sellSize: v.side === 'Sell' ? v.size : 0,
            buyCount: v.side === 'Buy' ? 1 : 0,
            sellCount: v.side === 'Sell' ? 1 : 0,
        })
    })
}