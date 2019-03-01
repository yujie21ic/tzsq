import { TradeAndOrderBook } from './TradeAndOrderBook'
import { BaseType } from '../../lib/BaseType'
import { config } from '../../config'
import { WebSocketClient } from '../../lib/C/WebSocketClient'

const 盘口map = (v: any) => ({
    price: Number(v[0]),
    size: Number(v[1]),
})

export class BinanceTradeAndOrderBook extends TradeAndOrderBook<BaseType.BinanceSymbol> {

    private ws = new WebSocketClient({
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

    constructor() {
        super()

        this.ws.onStatusChange = () => {
            this.statusObservable.next({ isConnected: this.ws.isConnected })
        }

        this.ws.onData = ({ stream, data }: { stream: string, data: any }) => {
            const arr = stream.split('@')
            const symbol = arr[0] as BaseType.BinanceSymbol
            const type = arr[1]

            if (type === 'trade') {
                this.tradeObservable.next({
                    symbol,
                    timestamp: data.E,
                    price: Number(data.p),
                    side: data.m ? 'Sell' : 'Buy',
                    size: Number(data.q),
                })
            }

            if (type === 'depth5') {
                this.orderBookObservable.next({
                    symbol,
                    timestamp: Date.now(),//直接读取本地时间
                    buy: data.bids.map(盘口map),
                    sell: data.asks.map(盘口map),
                })
            }
        }


    }
}