import { BaseType } from '../lib/BaseType'
import { SyncKLine } from './SyncKLine'
import { DB } from './DB'
import { BitMEXRESTAPI } from '../lib/BitMEX/BitMEXRESTAPI'
import { timeID } from '../lib/F/timeID'
import { sleep } from '../lib/C/sleep'


const get1000sData = async (startTime: number, symbol: BaseType.BitmexSymbol) => {

    const retArr: BaseType.KLine[] = []

    let start = 0

    while (true) {
        await sleep(1000 * 0.1) //休息0.1s
        const { data } = (await BitMEXRESTAPI.Trade.get('', {
            start,
            symbol,
            count: 500,
            startTime: new Date(startTime).toISOString(),
            endTime: new Date(startTime + 1000 * 1000).toISOString()
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
                    buySize: v.side === 'Buy' ? Math.abs(v.size) : 0,
                    sellSize: v.side === 'Sell' ? Math.abs(v.size) : 0,
                    buyCount: 1,
                    sellCount: 1,
                })
            })
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
                return new Date('2019-01-01T00:00:00').getTime()
            } else {
                return timeID._500msIDToTimestamp((lastItemID + 1))
            }
        },
        getData: async (start: number) => {
            //只采集10分钟前的数据
            if (new Date(start).getTime() + 10 * 60 * 1000 > Date.now()) {
                await sleep(1000 * 60)
                return { tickArr: [], newStart: start }
            }
            const data = await get1000sData(start, symbol)
            if (data === undefined) {
                await sleep(1000 * 60) //网络错误 休息 60s
                return { tickArr: [], newStart: start }
            } else {
                await sleep(1000 * 1) //休息1s
                return { tickArr: data, newStart: start + 1000 * 1000 }//采集了1000秒
            }
        }
    })