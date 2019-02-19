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

                const d = this.dataExt.XBTUSD.期货.信号_下跌
                console.log(d.length, d.length > 0 ? d[d.length - 1].map(v => v.value ? 'O' : '_').join('') : '')
            }
        }
    }

    const 加载多少秒数据 = (config.tick历史加载多少秒 || 300) + 120 //多2分钟

    export class RealData__History extends RealDataBase {

        private get_bitmex_orderBook = async (symbol: BaseType.BitmexSymbol | BaseType.HopexSymbol, startTime: number, endTime: number) => {

            const { data, error, msg } = await PKClient.func.getBitmex500msOrderBook({
                symbol,
                startTime,
                endTime,
            })

            if (data === undefined || data.length === 0) {
                console.info(`get_bitmex_orderBook ${symbol} 错误`, { msg, error, data })
                return []
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
            return ret
        }

        async get500msKLine(symbol: BaseType.BitmexSymbol | BaseType.BinanceSymbol | BaseType.HopexSymbol, startTime: number, endTime: number) {
            const { data, msg, error, } = await DBClient.func.getKLine({
                type: '500ms',
                symbol,
                startTime,
                endTime,
            })

            if (data === undefined || data.length === 0) {
                console.info(`get500msKLine ${symbol} 错误`, { msg, error, data })
                return []
            }


            //data 处理
            let index = 0
            let ret = [] as typeof data
            for (let i = timeID.timestampTo500msID(new Date(startTime).getTime()); i <= timeID.timestampTo500msID(new Date(startTime + 加载多少秒数据 * 1000).getTime()); i++) {
                if (data[index] === undefined || i < data[index].id) {
                    ret.push({
                        id: i,
                        open: NaN,
                        high: NaN,
                        low: NaN,
                        close: NaN,
                        buySize: NaN,
                        sellSize: NaN,
                        buyCount: NaN,
                        sellCount: NaN,
                    })
                } else {
                    ret.push(data[index])
                    index++
                }
            }
            return ret
        }



        async load(startTime: number) {
            startTime -= (1000 * 120) //2分钟前
            const endTime = startTime + 加载多少秒数据 * 1000
            this.load2(startTime, endTime)
        }



        async load2(startTime: number, endTime: number) {

            this.data.startTick = Math.floor(startTime / RealDataBase.单位时间)

            this.data.bitmex.XBTUSD.data = []
            this.data.bitmex.ETHUSD.data = []
            this.data.bitmex.XBTUSD.orderBook = []
            this.data.bitmex.ETHUSD.orderBook = []

            this.data.binance.btcusdt.data = []
            this.data.binance.ethusdt.data = []
            this.data.binance.btcusdt.orderBook = []
            this.data.binance.ethusdt.orderBook = []

            this.data.hopex.BTCUSDT.data = []
            this.data.hopex.ETHUSDT.data = []
            this.data.hopex.BTCUSDT.orderBook = []
            this.data.hopex.ETHUSDT.orderBook = []


            //bitmex
            this.data.bitmex.XBTUSD.orderBook = await this.get_bitmex_orderBook('XBTUSD', startTime, endTime)
            this.重新初始化()

            this.data.bitmex.ETHUSD.orderBook = await this.get_bitmex_orderBook('ETHUSD', startTime, endTime)
            this.重新初始化()

            this.data.bitmex.XBTUSD.data = await this.get500msKLine('XBTUSD', startTime, endTime)
            this.重新初始化()

            this.data.bitmex.ETHUSD.data = await this.get500msKLine('ETHUSD', startTime, endTime)
            this.重新初始化()


            //binance 没有盘口
            this.data.binance.btcusdt.data = await this.get500msKLine('btcusdt', startTime, endTime)
            this.重新初始化()

            this.data.binance.ethusdt.data = await this.get500msKLine('ethusdt', startTime, endTime)
            this.重新初始化()


            //hopex
            this.data.hopex.BTCUSDT.orderBook = await this.get_bitmex_orderBook('BTCUSDT', startTime, endTime)
            this.重新初始化()

            this.data.hopex.ETHUSDT.orderBook = await this.get_bitmex_orderBook('ETHUSDT', startTime, endTime)
            this.重新初始化()

            this.data.hopex.BTCUSDT.data = await this.get500msKLine('BTCUSDT', startTime, endTime)
            this.重新初始化()

            this.data.hopex.ETHUSDT.data = await this.get500msKLine('ETHUSDT', startTime, endTime)
            this.重新初始化()

        }
    }

}