import * as WebSocket from 'ws'
import { RealDataBase } from './RealDataBase'
import { WebSocketClient } from '../lib/C/WebSocketClient'
import { BaseType } from '../lib/BaseType'
import { config } from '../config'
import { BitmexTradeAndOrderBook } from '../lib/统一接口/BitmexTradeAndOrderBook'

const 盘口map = (v: any) => ({
    price: Number(v[0]),
    size: Number(v[1]),
})

export class RealData extends RealDataBase {

    private wss?: WebSocket.Server
    private wsDic = new Map<WebSocket, boolean>()

    private 期货 = new BitmexTradeAndOrderBook()

    private 现货ws = new WebSocketClient({
        ss: config.ss,
        url: 'wss://stream.binance.com:9443/stream?streams=' + [
            //近期交易
            'btcusdt@trade',
            'ethusdt@trade',
            //盘口 
            'btcusdt@depth5',
            'ethusdt@depth5'
        ].join('/')
    })

    onTitle = (p: {
        binance: boolean
        bitmex: boolean
    }) => { }


    constructor(server = true) {
        super()
        if (server) {
            this.wss = new WebSocket.Server({ port: 6666 })
        }

        this.现货ws.onStatusChange = this.期货.onStatusChange = () =>
            this.onTitle({
                binance: this.现货ws.isConnected,
                bitmex: this.期货.isConnected
            })


        //runServer
        if (this.wss !== undefined) {
            this.wss.on('connection', ws => {
                try {
                    ws.send(JSON.stringify({
                        path: [],
                        value: this.data
                    }))
                } catch (error) {

                }
                this.wsDic.set(ws, true)
                ws.onerror = ws.onclose = () => this.wsDic.delete(ws)
            })
        }

        this.jsonSync.subject.subscribe(
            op => {
                const str = JSON.stringify(op)
                this.wsDic.forEach((_, ws) => {
                    try { ws.send(str) } catch (error) { }
                })
            }
        )

        //run期货
        this.期货.onTrade = ({ symbol, timestamp, side, size, price }) => {
            this.on着笔({
                symbol,
                xxxxxxxx: this.jsonSync.data.bitmex[symbol as 'XBTUSD'].data,
                timestamp,
                side: side as BaseType.Side,
                size,
                price,
            })
            this.期货价格dic.set(symbol as BaseType.BitmexSymbol, price)
            this.priceObservable.next({ symbol, price })
        }

        this.期货.onOrderBook = ({ symbol, timestamp, buy, sell }) => {
            this.on盘口({
                symbol,
                xxxxxxxx: this.jsonSync.data.bitmex[symbol as 'XBTUSD'].orderBook,
                timestamp,
                orderBook: {
                    id: Math.floor(timestamp / RealDataBase.单位时间),
                    buy,
                    sell,
                }
            })
            this.期货盘口dic.set(symbol as BaseType.BitmexSymbol, {
                id: Math.floor(timestamp / RealDataBase.单位时间),
                buy,
                sell,
            })
        }


        //run现货
        this.现货ws.onData = ({ stream, data }: { stream: string, data: any }) => {
            const arr = stream.split('@')
            const symbol = arr[0] as BaseType.BinanceSymbol
            const type = arr[1]

            //现货盘口
            if (type === 'depth5') {

                this.on盘口({
                    symbol,
                    xxxxxxxx: this.jsonSync.data.binance[symbol as 'btcusdt'].orderBook,
                    timestamp: Date.now(),//直接读取本地时间
                    orderBook: {
                        id: Math.floor(Date.now() / RealDataBase.单位时间),
                        buy: data.bids.map(盘口map),
                        sell: data.asks.map(盘口map)
                    }
                })
            }

            //近期交易
            if (type === 'trade') {
                this.on着笔({
                    symbol,
                    xxxxxxxx: this.jsonSync.data.binance[symbol as 'btcusdt'].data,
                    timestamp: data.E,
                    price: Number(data.p),
                    side: data.m ? 'Sell' : 'Buy',
                    size: Number(data.q),
                })

                this.现货价格dic.set(symbol, Number(data.p))
                this.priceObservable.next({ symbol, price: Number(data.p) })
            }
        }
    }
}