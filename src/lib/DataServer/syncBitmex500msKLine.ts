import { BaseType } from '../BaseType'
import { SyncKLine } from './SyncKLine'
import { DB } from './DB'
import { timeID } from '../F/timeID'
import { sleep } from '../F/sleep'
import { BitMEXHTTP } from '../____API____/BitMEX/BitMEXHTTP'
import { toRange } from '../F/toRange'


const getData = async (p: {
    多少秒: number
    startTime: number
    symbol: BaseType.BitmexSymbol
}) => {

    const retArr: BaseType.KLine[] = []

    let start = 0

    while (true) {
        const { data } = (await BitMEXHTTP.Trade.get('', {
            start,
            symbol: p.symbol,
            count: 500,
            startTime: new Date(p.startTime).toISOString(),
            endTime: new Date(p.startTime + 1000 * p.多少秒).toISOString()
        }))

        if (data === undefined) {
            return undefined
        }

        else if (data.length > 0) {
            start += data.length
            data.forEach(v => {
                retArr.push({
                    id: timeID._500ms.toID(new Date(v.timestamp).getTime()),
                    open: v.price,
                    high: v.price,
                    low: v.price,
                    close: v.price,
                    buySize: v.side === 'Buy' ? v.size : 0,
                    buyCount: v.side === 'Buy' ? 1 : 0,
                    sellSize: v.side === 'Sell' ? v.size : 0,
                    sellCount: v.side === 'Sell' ? 1 : 0,
                })
            })
            if (data.length < 500) {
                return retArr
            } else {
                await sleep(1000 * 1) //休息1s
            }
        }
        else {
            return retArr
        }
    }
}


export const syncBitmex500msKLine = (symbol: BaseType.BitmexSymbol) =>
    new SyncKLine({
        getName: () => `syncBitmex500msKLine ${symbol}`,
        getTable: () => DB.getKLine('500ms', symbol),
        get采集start: async (lastItemID: number) => {
            if (isNaN(lastItemID)) {
                return new Date('2019-01-15T00:00:00').getTime()
            } else {
                return timeID._500ms.toTimestamp((lastItemID + 1))
            }
        },
        getData: async (start: number) => {

            const _30秒前 = Date.now() - 1000 * 30

            //只采集 30秒 前的数据
            if (start > _30秒前) {
                await sleep(1000 * 1) //休息1s
                return { tickArr: [], newStart: start }
            }


            const 采集多少秒 = toRange({
                min: 20,
                max: 1000,
                value: (_30秒前 - start) / 1000,
            })

            const data = await getData({
                多少秒: 采集多少秒,
                startTime: start,
                symbol,
            })

            if (data === undefined) {
                await sleep(1000 * 1) //休息1s
                return { tickArr: [], newStart: start }
            } else {
                await sleep(1000 * 1) //休息1s
                return { tickArr: data, newStart: start + 1000 * 采集多少秒 }
            }
        }
    })