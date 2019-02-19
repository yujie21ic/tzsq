import * as WebSocket from 'ws'
import { RealDataBase } from './RealDataBase'
import { BaseType } from '../lib/BaseType'
import { BitmexTradeAndOrderBook } from '../lib/统一接口/TradeAndOrderBook/BitmexTradeAndOrderBook'
import { BinanceTradeAndOrderBook } from '../lib/统一接口/TradeAndOrderBook/BinanceTradeAndOrderBook'
import { HopexTradeAndOrderBook } from '../lib/统一接口/TradeAndOrderBook/HopexTradeAndOrderBook'

export class RealData extends RealDataBase {

    private wss?: WebSocket.Server
    private wsDic = new Map<WebSocket, boolean>()

    private bitmex = new BitmexTradeAndOrderBook()
    private binance = new BinanceTradeAndOrderBook()
    private hopex = new HopexTradeAndOrderBook()

    _binance = false
    _bitmex = false
    _hopex = false
    onTitle = (p: {
        binance: boolean
        bitmex: boolean
        hopex: boolean
    }) => { }

    constructor(server = true) {
        super()
        if (server) {
            this.wss = new WebSocket.Server({ port: 6666 })
        }

        this.bitmex.statusObservable.subscribe(v => {
            this._bitmex = v.isConnected
            this.onTitle({
                binance: this._binance,
                bitmex: this._bitmex,
                hopex: this._hopex,
            })
        })

        this.binance.statusObservable.subscribe(v => {
            this._binance = v.isConnected
            this.onTitle({
                binance: this._binance,
                bitmex: this._bitmex,
                hopex: this._hopex,
            })
        })

        this.hopex.statusObservable.subscribe(v => {
            this._hopex = v.isConnected
            this.onTitle({
                binance: this._binance,
                bitmex: this._bitmex,
                hopex: this._hopex,
            })
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
        this.bitmex.tradeObservable.subscribe(({ symbol, timestamp, side, size, price }) => {
            this.on着笔({
                symbol,
                xxxxxxxx: this.jsonSync.data.bitmex[symbol].data,
                timestamp,
                side: side as BaseType.Side,
                size,
                price,
            })
            this.期货价格dic.set(symbol as BaseType.BitmexSymbol, price)
        })

        this.bitmex.orderBookObservable.subscribe(({ symbol, timestamp, buy, sell }) => {
            this.on盘口({
                symbol,
                xxxxxxxx: this.jsonSync.data.bitmex[symbol].orderBook,
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
        })

        this.binance.tradeObservable.subscribe(({ symbol, timestamp, price, side, size }) => {
            this.on着笔({
                symbol,
                xxxxxxxx: this.jsonSync.data.binance[symbol].data,
                timestamp,
                price,
                side,
                size,
            })
        })


        this.binance.orderBookObservable.subscribe(({ symbol, timestamp, buy, sell }) => {
            this.on盘口({
                symbol,
                xxxxxxxx: this.jsonSync.data.binance[symbol].orderBook,
                timestamp,
                orderBook: {
                    id: Math.floor(timestamp / RealDataBase.单位时间),
                    buy,
                    sell,
                }
            })

        })



        this.hopex.tradeObservable.subscribe(({ symbol, timestamp, price, side, size }) => {
            this.on着笔({
                symbol,
                xxxxxxxx: this.jsonSync.data.hopex[symbol].data,
                timestamp,
                price,
                side,
                size,
            })
        })


        this.hopex.orderBookObservable.subscribe(({ symbol, timestamp, buy, sell }) => {
            this.on盘口({
                symbol,
                xxxxxxxx: this.jsonSync.data.hopex[symbol].orderBook,
                timestamp,
                orderBook: {
                    id: Math.floor(timestamp / RealDataBase.单位时间),
                    buy,
                    sell,
                }
            })
        })


    }
}