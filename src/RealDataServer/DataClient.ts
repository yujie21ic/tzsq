import { RealDataBase } from './RealDataBase'
import { WebSocketClient } from '../lib/C/WebSocketClient'
import { deepMapNullToNaN } from '../lib/F/deepMapNullToNaN'
import { config } from '../config'
import { BaseType } from '../lib/BaseType'
import { DBClient } from '../DBServer/DBClient'
import { timeID } from '../lib/F/timeID'
import { PKClient } from '../PKServer/PKClient'

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

    const 加载多少秒数据 = (config.tick历史加载多少秒 || 300) + 120 //多2分钟

    export class RealData__History extends RealDataBase {

        private get_bitmex_orderBook = async (symbol: BaseType.BitmexSymbol, startTime: number) => {

            const { data, error, msg } = await PKClient.func.getBitmex500msOrderBook({
                symbol,
                startTime,
                endTime: startTime + 加载多少秒数据 * 1000
            })

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

        async get500msKLine(symbol: BaseType.BitmexSymbol | BaseType.BinanceSymbol, startTime: number) {
            const { data } = await DBClient.func.getKLine({
                type: '500ms',
                symbol,
                startTime,
                endTime: startTime + (加载多少秒数据 * 1000)
            })
            return data || []
        }



        async load(startTime: number) {
            startTime -= (1000 * 120) //2分钟前

            this.data.startTick = Math.floor(startTime / RealDataBase.单位时间)

            this.data.bitmex.XBTUSD.data = []
            this.data.bitmex.ETHUSD.data = []

            this.data.binance.btcusdt.data = []
            this.data.binance.ethusdt.data = []

            this.get_bitmex_orderBook('XBTUSD', startTime)
            this.get_bitmex_orderBook('ETHUSD', startTime)

            this.data.bitmex.XBTUSD.data = await this.get500msKLine('XBTUSD', startTime)
            console.log('XBTUSD 500msKLine', this.data.bitmex.XBTUSD.data)
            this.重新初始化()

            this.data.bitmex.ETHUSD.data = await this.get500msKLine('ETHUSD', startTime)
            console.log('ETHUSD 500msKLine', this.data.bitmex.ETHUSD.data)
            this.重新初始化()

            this.data.binance.btcusdt.data = await this.get500msKLine('btcusdt', startTime)
            console.log('btcusdt 500msKLine', this.data.binance.btcusdt.data)
            this.重新初始化()

            this.data.binance.ethusdt.data = await this.get500msKLine('ethusdt', startTime)
            console.log('ethusdt 500msKLine', this.data.binance.ethusdt.data)
            this.重新初始化()

        }
    }

}