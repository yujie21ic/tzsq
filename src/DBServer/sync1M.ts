import * as Sequelize from 'sequelize'
import { BaseType } from '../lib/BaseType'
import { SyncKLine } from './SyncKLine'
import { DB } from './DB'
import { timeID } from '../lib/F/timeID'
import { sleep } from '../lib/C/sleep'


export const sync1M = (symbol: BaseType.BitmexSymbol | BaseType.BinanceSymbol) =>
    new SyncKLine({
        getName: () => `sync1M ${symbol}`,
        getTable: () => DB.getKLine('1m', symbol),
        get采集start: async (lastItemID: number) => {
            if (isNaN(lastItemID)) {
                return 0
            } else {
                return timeID.timestampTo500msID(timeID.oneMinuteIDToTimestamp(lastItemID + 1))
            }
        },
        getData: async (start: number) => {
            const tickArr = (await DB.getKLine('500ms', symbol).findAll<{}>({
                raw: true,
                where: {
                    id: {
                        [Sequelize.Op.gte]: start,
                    }
                },
                order: ['id'],
                limit: 1000,
            }))
            const newStart = tickArr.length > 0 ? tickArr[tickArr.length - 1].id + 1 : start
            if (tickArr.length < 100) {
                await sleep(1000 * 60) //休息60s
            } else {
                await sleep(1000 * 0.1) //休息0.1s
            }
            return {
                tickArr: tickArr.map(v => ({
                    id: timeID.timestampToOneMinuteID(timeID._500msIDToTimestamp(v.id)),
                    open: v.open,
                    high: v.high,
                    low: v.low,
                    close: v.close,
                    buySize: v.buySize,
                    sellSize: v.sellSize,
                    buyCount: v.buyCount,
                    sellCount: v.sellCount,
                })),
                newStart,
            }
        }
    })