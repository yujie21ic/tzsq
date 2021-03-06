import { RealDataBase } from './RealDataBase'
import { WebSocketClient } from '../F/WebSocketClient'
import { deepMapNullToNaN } from '../F/deepMapNullToNaN'
import { config } from '../config'
import { BaseType } from '../BaseType'
import { DBClient } from '../DataServer/DBClient'
import { timeID } from '../F/timeID'
import { PKClient } from '../DataServer/PKClient'
import { DBServer } from '../DataServer/DBServer'
import { PKServer } from '../DataServer/PKServer'

export namespace DataClient {

    export class RealData__Client extends RealDataBase {

        private ws = new WebSocketClient({
            name:'DataClient',
            url: 'ws://127.0.0.1:6666',
        })

        constructor() {
            super()
            this.ws.onData = obj => {
                const { path, value } = deepMapNullToNaN(obj)
                this.jsonSync.set({ path, value })
                if (path.length === 0) {
                    this.重新初始化()
                }

                //const d = this.dataExt.XBTUSD.期货.信号_下跌
                //console.log(d.length, d.length > 0 ? d[d.length - 1].map(v => v.value ? 'O' : '_').join('') : '')
            }
        }
    }

    const 加载多少秒数据 = (config.tick历史加载多少秒 || 300) + 120 //多2分钟

    export class RealData__History extends RealDataBase {

        private get_bitmex_orderBook = async (symbol: BaseType.BitmexSymbol | BaseType.HopexSymbol, startTime: number, endTime: number, 本地 = false) => {

            const { data, error, msg } = await (本地 ? PKServer.模拟客户端调用.getBitmex500msOrderBook : PKClient.func.getBitmex500msOrderBook)({
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
            for (let i = timeID._500ms.toID(startTime); i <= timeID._500ms.toID(endTime); i++) {
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

        async get500msKLine(symbol: BaseType.BitmexSymbol | BaseType.BinanceSymbol | BaseType.HopexSymbol, startTime: number, endTime: number, 本地 = false) {
            const { data, msg, error, } = await (本地 ? DBServer.模拟客户端调用.getKLine : DBClient.func.getKLine)({
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
            for (let i = timeID._500ms.toID(startTime); i <= timeID._500ms.toID(endTime); i++) {
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




        //回测ext
        回测ext__orderBook: BaseType.OrderBook[] = []
        回测ext__data: BaseType.KLine[] = []

        回测ext__hopex__orderBook: BaseType.OrderBook[] = []
        回测ext__hopex__data: BaseType.KLine[] = []
        nowIndex = 0

        async 回测load(startTime: number, endTime: number) {
            this.data.startTick = Math.floor(startTime / RealDataBase.单位时间)
            this.data.bitmex.XBTUSD.data = []
            this.data.bitmex.XBTUSD.orderBook = []
            this.data.hopex.BTCUSDT.data = []
            this.data.hopex.BTCUSDT.orderBook = []

            console.log('加载盘口...')
            this.回测ext__orderBook = await this.get_bitmex_orderBook('XBTUSD', startTime, endTime, false)
            console.log('加载盘口', this.回测ext__orderBook.length)

            console.log('加载价格...')
            this.回测ext__data = await this.get500msKLine('XBTUSD', startTime, endTime, false)
            console.log('加载价格', this.回测ext__data.length)

            console.log('加载hopex...')
            this.回测ext__hopex__orderBook = await this.get_bitmex_orderBook('BTCUSDT', startTime, endTime)
            this.回测ext__hopex__data = await this.get500msKLine('BTCUSDT', startTime, endTime)
            console.log('加载hopex...')

            this.nowIndex = 0
            this.重新初始化()
        }

        回测step() {
            if (this.nowIndex < this.回测ext__orderBook.length) {
                this.data.bitmex.XBTUSD.orderBook.push(this.回测ext__orderBook[this.nowIndex])
                this.data.bitmex.XBTUSD.data.push(this.回测ext__data[this.nowIndex])
                this.data.hopex.BTCUSDT.orderBook.push(this.回测ext__hopex__orderBook[this.nowIndex])
                this.data.hopex.BTCUSDT.data.push(this.回测ext__hopex__data[this.nowIndex])
                this.nowIndex++
                return true
            } else {
                return false
            }
        }


        ctpLoad(data: BaseType.KLine[], orderBook: BaseType.OrderBook[]) {

            this.data.bitmex.XBTUSD.data = []
            this.data.bitmex.ETHUSD.data = []
            this.data.bitmex.XBTUSD.orderBook = []
            this.data.bitmex.ETHUSD.orderBook = [] 

            this.data.hopex.BTCUSDT.data = []
            this.data.hopex.ETHUSDT.data = []
            this.data.hopex.BTCUSDT.orderBook = []
            this.data.hopex.ETHUSDT.orderBook = []


            this.data.startTick = data[0].id
            this.data.ctp.rb1910.data = data
            this.data.ctp.rb1910.orderBook = orderBook
            console.log('rb1910', data, orderBook)
            this.重新初始化()
        }

    }
}