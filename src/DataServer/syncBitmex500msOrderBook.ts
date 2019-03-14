import { BitMEXWSAPI } from '../统一接口/BitMEX/BitMEXWSAPI'
import { Sampling } from '../lib/C/Sampling'
import { BaseType } from '../lib/BaseType'
import { DB } from './DB'
import { timeID } from '../lib/F/timeID'

const 盘口map = (v: any) => ({
    price: Number(v[0]),
    size: Number(v[1])
})

let samplingDic: { [symbol: string]: Sampling<BaseType.OrderBook> }
let ws: BitMEXWSAPI

export const syncBitmex500msOrderBook = async () => {

    ws = new BitMEXWSAPI('', [
        { theme: 'orderBook10', filter: 'XBTUSD' },
        { theme: 'orderBook10', filter: 'ETHUSD' },
    ])

    ws.onStatusChange = () => {
        samplingDic = Object.create(null)
        console.log(new Date().toLocaleString(), 'syncBitmex500msOrderBook isConnected ', ws.isConnected)
    }

    ws.onmessage = frame => {
        if (frame.table === 'orderBook10' && (frame.action === 'update' || frame.action === 'partial')) {
            const { symbol, bids, asks, timestamp } = frame.data[0]

            if (samplingDic[symbol] === undefined) {
                samplingDic[symbol] = new Sampling<BaseType.OrderBook>({
                    buy: '最新',
                    sell: '最新',
                })

                const table = DB.getBitmex500msOrderBook(symbol as BaseType.BitmexSymbol)

                //创建表
                table.sync()

                samplingDic[symbol].onComplete2 = item => {

                    try {
                        table.create({
                            id: item.id,
                            buy1_price: item.buy[0].price,
                            buy1_size: item.buy[0].size,
                            sell1_price: item.sell[0].price,
                            sell1_size: item.sell[0].size,

                            buy2_price: item.buy[1].price,
                            buy2_size: item.buy[1].size,
                            sell2_price: item.sell[1].price,
                            sell2_size: item.sell[1].size,

                            buy3_price: item.buy[2].price,
                            buy3_size: item.buy[2].size,
                            sell3_price: item.sell[2].price,
                            sell3_size: item.sell[2].size,

                            buy4_price: item.buy[3].price,
                            buy4_size: item.buy[3].size,
                            sell4_price: item.sell[3].price,
                            sell4_size: item.sell[3].size,

                            buy5_price: item.buy[4].price,
                            buy5_size: item.buy[4].size,
                            sell5_price: item.sell[4].price,
                            sell5_size: item.sell[4].size,
                        })
                    } catch (error) {
                        console.log(`syncBitmex500msOrderBook id:${item.id} 写入失败 error:${error}`)
                    }
                }
            }

            samplingDic[symbol].in2({
                id: timeID.timestampTo500msID(new Date(timestamp).getTime()),
                buy: bids.map(盘口map),
                sell: asks.map(盘口map),
            })
        }
    }
}