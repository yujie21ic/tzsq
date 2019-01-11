import * as WebSocket from 'ws'
import { RealDataBase } from './RealDataBase'
import { BitMEXWSAPI } from '../lib/BitMEX/BitMEXWSAPI'
import { WebSocketClient } from '../lib/C/WebSocketClient'
import { BaseType } from '../lib/BaseType'
import { config } from '../config'

const 盘口map = (v: any) => ({
    price: Number(v[0]),
    size: Number(v[1]),
})

export class RealData extends RealDataBase {

    private wss?: WebSocket.Server
    private wsDic = new Map<WebSocket, boolean>()

    private 期货ws = new BitMEXWSAPI('', [
        { theme: 'trade', filter: 'XBTUSD' },
        { theme: 'trade', filter: 'ETHUSD' },
        { theme: 'orderBook10', filter: 'XBTUSD' },
        { theme: 'orderBook10', filter: 'ETHUSD' },
    ])

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

        this.现货ws.onStatusChange = this.期货ws.onStatusChange = () =>
            this.onTitle({
                binance: this.现货ws.isConnected,
                bitmex: this.期货ws.isConnected
            })


        //runServer
        if (this.wss !== undefined) {
            this.wss.on('connection', ws => {
                ws.send(JSON.stringify({
                    path: [],
                    value: this.data
                }))
                this.wsDic.set(ws, true)
                ws.onerror = ws.onclose = () => this.wsDic.delete(ws)
            })
        }

        this.jsonSync.subject.subscribe(
            op => {
                const str = JSON.stringify(op)
                this.wsDic.forEach((_, ws) => ws.send(str))
            }
        )

        //run期货
        this.期货ws.onmessage = frame => {

            if (frame.table === 'trade' && (frame.action === 'partial' || frame.action === 'insert')) {

                frame.data.forEach(({ symbol, side, size, price, timestamp }) => {
                    this.on着笔({
                        symbol,
                        xxxxxxxx: this.jsonSync.data.bitmex[symbol as 'XBTUSD'].data,
                        timestamp: new Date(timestamp).getTime(),
                        side: side as BaseType.Side,
                        size,
                        price,
                    })
                    this.期货价格dic.set(symbol as BaseType.BitmexSymbol, price)
                    this.priceObservable.next({ symbol, price })
                })
            }

            //服务器bug  partial 了2次 orderBook10  keys 都是 symbol   然后 update
            if (frame.table === 'orderBook10' && (frame.action === 'update' || frame.action === 'partial')) {
                const { symbol, bids, asks, timestamp } = frame.data[0]

                this.on盘口({
                    symbol,
                    xxxxxxxx: this.jsonSync.data.bitmex[symbol as 'XBTUSD'].orderBook,
                    timestamp: new Date(timestamp).getTime(),
                    orderBook: {
                        id: Math.floor(new Date(timestamp).getTime() / RealDataBase.单位时间),
                        buy: bids.map(盘口map).slice(0, 10),
                        sell: asks.map(盘口map).slice(0, 10),
                    }
                })

                this.期货盘口dic.set(symbol as BaseType.BitmexSymbol, {
                    id: Math.floor(new Date(timestamp).getTime() / RealDataBase.单位时间),
                    buy: bids.map(盘口map),
                    sell: asks.map(盘口map),
                })
            }
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