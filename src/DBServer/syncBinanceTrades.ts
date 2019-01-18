import { BaseType } from '../lib/BaseType'
import { DB } from './DB'
import { JSONRequest } from '../lib/C/JSONRequest'
import { sleep } from '../lib/C/sleep'
import { config } from '../config'
import { queryStringStringify } from '../lib/F/queryStringStringify'

export const syncBinanceTrades = async (
    symbol: BaseType.BinanceSymbol,
    fromID: number
) => {

    const { table } = DB.getTrades(symbol)

    //创建表
    await table.sync()

    //接着最后的ID开始同步     
    const lastID = await table.max('id')
    if (typeof lastID === 'number' && isNaN(lastID) === false) {
        fromID = lastID + 1
    }

    //同步数据
    while (true) {
        const url = `https://api.binance.com/api/v1/aggTrades?` + queryStringStringify({
            symbol: symbol.toUpperCase(),
            fromId: fromID,
            limit: 1000
        })
        const data = (await JSONRequest({
            url,
            ss: config.ss
        })).data
        if (Array.isArray(data)) {
            if (data.length < 100) {
                //没有数据了 等一分钟再试
                await sleep(1000 * 60)
            } else {
                try {
                    await table.bulkCreate(data.map(v =>
                        ({
                            id: v.a,
                            timestamp: v.T,
                            price: Number(v.p),
                            size: Number(v.q) * (v.m ? -1 : 1) //主动买是正
                        })
                    ))
                    fromID = data[data.length - 1].a + 1
                } catch (error) {
                    console.log(`syncBinanceTrades 出错  fromID:${fromID} error:${error}`)
                }
            }
        }
        await sleep(1000 * 0.1) //休息0.1s
    }
}