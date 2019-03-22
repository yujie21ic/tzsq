import { BaseType } from '../BaseType'
import { SyncKLine } from './SyncKLine'
import { DB } from './DB'
import { timeID } from '../F/timeID'
import { sleep } from '../C/sleep'
import { BitMEXRESTAPI } from '../____API____/BitMEX/BitMEXRESTAPI'


const getData = async (p: {
    多少秒: number
    startTime: number
    symbol: BaseType.BitmexSymbol
}) => {

    const retArr: BaseType.KLine[] = []

    let start = 0

    while (true) {
        await sleep(1000 * 0.1) //休息0.1s

        const { data } = (await BitMEXRESTAPI.Trade.get('', {
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
                    id: timeID.timestampTo500msID(new Date(v.timestamp).getTime()),
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
            if (data.length < 500) return retArr
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
                return timeID._500msIDToTimestamp((lastItemID + 1))
            }
        },
        getData: async (start: number) => {
            //只采集 30秒 前的数据
            if (start + 1000 * 30 > Date.now()) {
                await sleep(1000 * 0.2) //休息0.2s
                return { tickArr: [], newStart: start }
            }

            //采集10秒
            const data = await getData({
                多少秒: 10,
                startTime: start,
                symbol,
            })
            if (data === undefined) {
                await sleep(1000 * 0.2) //休息0.2s
                return { tickArr: [], newStart: start }
            } else {
                await sleep(1000 * 0.2) //休息0.2s
                return { tickArr: data, newStart: start + 1000 * 10 } //采集了10秒
            }
        }
    })