import * as Sequelize from 'sequelize'
import { BaseType } from '../lib/BaseType'
import { SyncKLine } from './SyncKLine'
import { DB } from './DB'
import { timeID } from '../lib/F/timeID'
import { sleep } from '../lib/C/sleep'


export const syncBinance500ms = (symbol: BaseType.BinanceSymbol) =>
    new SyncKLine({
        getName: () => `syncBinance500ms ${symbol}`,
        getTable: () => DB.getKLine('500ms', symbol),
        get采集start: async (lastItemID: number) => {
            if (isNaN(lastItemID)) {
                return 0
            } else {
                const timestamp = timeID._500msIDToTimestamp(lastItemID + 1)

                const obj = await DB.getTrades(symbol).findOne<{}>({
                    raw: true,
                    where: {
                        timestamp: {
                            [Sequelize.Op.gte]: timestamp,
                        }
                    },
                    order: ['id'],
                })

                if (obj) {
                    return obj.id
                } else {
                    return 0 //<---------
                }
            }
        },
        getData: async (start: number) => {
            const tickArr = await DB.getTrades(symbol).findAll<{}>({
                raw: true,
                where: {
                    id: {
                        [Sequelize.Op.gte]: start,
                    }
                },
                order: ['id'],
                limit: 1000
            })
            const newStart = tickArr.length > 0 ? tickArr[tickArr.length - 1].id + 1 : start
            if (tickArr.length < 100) {
                await sleep(1000 * 60) //休息60s
            } else {
                await sleep(1000 * 0.1) //休息0.1s
            }
            return {
                tickArr: tickArr.map(v => ({
                    id: timeID.timestampTo500msID(v.timestamp),
                    open: v.price,
                    high: v.price,
                    low: v.price,
                    close: v.price,
                    buySize: v.size > 0 ? Math.abs(v.size) : 0,
                    sellSize: v.size < 0 ? Math.abs(v.size) : 0,
                    buyCount: 1,
                    sellCount: 1,
                })),
                newStart
            }
        }
    })