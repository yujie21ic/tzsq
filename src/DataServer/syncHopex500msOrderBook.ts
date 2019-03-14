import { Sampling } from '../lib/C/Sampling'
import { BaseType } from '../lib/BaseType'
import { DB } from './DB'
import { timeID } from '../lib/F/timeID'
import { HopexTradeAndOrderBook } from '../统一接口/TradeAndOrderBook/HopexTradeAndOrderBook'

//重复

let samplingDic: { [symbol: string]: Sampling<BaseType.OrderBook> }
let ws = new HopexTradeAndOrderBook('order_book')

export const syncHopex500msOrderBook = async () => {

    ws.statusObservable.subscribe(v => {
        samplingDic = Object.create(null)
        console.log(new Date().toLocaleString(), 'syncHopex500msOrderBook isConnected ', v.isConnected)
    })

    ws.orderBookObservable.subscribe(v => {
        const { symbol, buy, sell, timestamp } = v

        if (samplingDic[symbol] === undefined) {
            samplingDic[symbol] = new Sampling<BaseType.OrderBook>({
                buy: '最新',
                sell: '最新',
            })

            const table = DB.getBitmex500msOrderBook(symbol as BaseType.HopexSymbol)

            //创建表
            table.sync()

            samplingDic[symbol].onComplete2 = item => {
                const { buy, sell } = item
                try {
                    table.create({
                        id: item.id,
                        buy1_price: buy[0].price,
                        buy1_size: buy[0].size,
                        sell1_price: sell[0].price,
                        sell1_size: sell[0].size,

                        buy2_price: buy[1].price,
                        buy2_size: buy[1].size,
                        sell2_price: sell[1].price,
                        sell2_size: sell[1].size,

                        buy3_price: buy[2].price,
                        buy3_size: buy[2].size,
                        sell3_price: sell[2].price,
                        sell3_size: sell[2].size,

                        buy4_price: buy[3].price,
                        buy4_size: buy[3].size,
                        sell4_price: sell[3].price,
                        sell4_size: sell[3].size,

                        buy5_price: buy[4].price,
                        buy5_size: buy[4].size,
                        sell5_price: sell[4].price,
                        sell5_size: sell[4].size,
                    })
                } catch (error) {
                    console.log(`syncHopex500msOrderBook id:${item.id} 写入失败 error:${error}`)
                }
            }
        }

        samplingDic[symbol].in2({
            id: timeID.timestampTo500msID(timestamp),
            buy,
            sell,
        })
    })
}