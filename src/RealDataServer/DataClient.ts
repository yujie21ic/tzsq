import { RealDataBase } from './RealDataBase'
import { WebSocketClient } from '../lib/C/WebSocketClient'
import { deepMapNullToNaN } from '../lib/F/deepMapNullToNaN'
import { config } from '../config'
import { BaseType } from '../lib/BaseType' 
import { DBClient } from '../DBServer/DBClient'
import { timeID } from '../lib/F/timeID'

export namespace DataClient {


    export class RealData__Client extends RealDataBase {

        private ws = new WebSocketClient({
            url: 'ws://127.0.0.1:6666'
        })

        constructor() {
            super()
            this.ws.onData = obj => {
                const { path, value } = deepMapNullToNaN(obj)
                this.jsonSync.set({ path, value })
                if (path.length === 0) {
                    this.重新初始化()
                }
            }
        }
    }

    const 加载多少秒数据 = config.tick历史加载多少秒 || 300

    export class RealData__History extends RealDataBase {

        private get_binance_tick = async (symbol: BaseType.BinanceSymbol, startTime: number) => {

            const { data, error, msg } = (await DBClient.func.getBinanceTick({
                symbol,
                startTime: startTime - 30 * 1000,   //30秒前 
                endTime: startTime + (加载多少秒数据 + 30) * 1000    //(加载多少秒数据 + 30)秒后 
            }))

            if (data === undefined || data.length === 0) {
                console.info(`get_binance_tick ${symbol} 错误`, { msg, error, data })
                this.重新初始化()
                return
            }

            for (let i = 0; i < data.length; i++) {
                this.on着笔({
                    symbol,
                    xxxxxxxx: this.jsonSync.data.binance[symbol as 'btcusdt'].data,
                    timestamp: data[i].timestamp,
                    side: data[i].size > 0 ? 'Buy' : 'Sell',
                    price: data[i].price,
                    size: Math.abs(data[i].size),
                })

                if (this.jsonSync.rawData.binance[symbol as 'btcusdt'].data.length >= 加载多少秒数据 * (1000 / RealDataBase.单位时间)) {
                    this.重新初始化()
                    return
                }
            }


            this.重新初始化()
            return
        }


        private get_bitmex_orderBook = async (symbol: BaseType.BitmexSymbol, startTime: number) => {

            const { data, error, msg } = (await DBClient.func.getBitmex500msOrderBook({
                symbol,
                startTime,
                endTime: startTime + 加载多少秒数据 * 1000
            }))

            if (data === undefined || data.length === 0) {
                console.info(`get_bitmex_orderBook ${symbol} 错误`, { msg, error, data })
                this.重新初始化()
                return
            }

            //data 处理
            let index = 0
            let ret = [] as typeof data
            for (let i = timeID.timestampTo500msID(new Date(startTime).getTime()); i <= timeID.timestampTo500msID(new Date(startTime + 加载多少秒数据 * 1000).getTime()); i++) {
                if (data[index] === undefined || i < data[index].id) {
                    ret.push({
                        id: i,
                        buy: [],
                        sell: [],
                    })
                } else {
                    ret.push(data[index])
                    index++
                }
            }

            this.data.bitmex[symbol as 'XBTUSD'].orderBook = ret
            this.重新初始化()
            return
        }

        async getBitmex500msKLine(symbol: BaseType.BitmexSymbol, startTime: number) {
            const { data } = await DBClient.func.getKLine({
                type: '500ms',
                symbol,
                startTime,
                endTime: startTime + (加载多少秒数据 * 1000)
            })
            return data || []
        }

        async load(startTime: number) {
            this.data.startTick = Math.floor(startTime / RealDataBase.单位时间)
            this.data.nowTick = Math.floor(startTime / RealDataBase.单位时间)

            this.data.bitmex.XBTUSD.data = []
            this.data.bitmex.ETHUSD.data = []

            this.data.binance.btcusdt.data = []
            this.data.binance.ethusdt.data = []

            this.get_bitmex_orderBook('XBTUSD', startTime)
            this.get_bitmex_orderBook('ETHUSD', startTime)

            this.data.bitmex.XBTUSD.data = await this.getBitmex500msKLine('XBTUSD', startTime)
            this.data.bitmex.ETHUSD.data = await this.getBitmex500msKLine('ETHUSD', startTime)

            this.get_binance_tick('btcusdt', startTime)
            this.get_binance_tick('ethusdt', startTime)
        }
    }

}