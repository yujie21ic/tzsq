import { TradeAndOrderBook } from './TradeAndOrderBook'
import { config } from '../../../config'
import { WebSocketClient } from '../../F/WebSocketClient'
import { splitEvery } from 'ramda'


export class FCOIN extends TradeAndOrderBook {

    private ws = new WebSocketClient({
        ss: config.ss,
        url: 'wss://api.fcoin.com/v2/ws'
    })

    constructor() {
        super()

        setInterval(() => {
            if (this.ws.isConnected) {
                this.ws.sendJSON({ 'cmd': 'ping', 'args': [Date.now()], id: '__ping__' })
            }
        }, 1000)

        this.ws.onStatusChange = () => {
            if (this.ws.isConnected) {
                this.ws.sendJSON({ 'cmd': 'sub', 'args': ['depth.L20.btcusdt', 'trade.btcusdt'], id: '__depth__and__trade__' })
            }
            this.statusObservable.next({
                isConnected: this.ws.isConnected
            })
        }


        this.ws.onData = (d: {}) => {
            const type = ((d as any).type as string).split('.')
            const topic = type[0]
            const symbol = type[type.length - 1]

            if (topic === 'depth') {

                const depth = d as {
                    ts: number
                    bids: number[]
                    asks: number[]

                }

                this.orderBookObservable.next({
                    symbol,
                    timestamp: depth.ts,
                    buy: splitEvery<number>(2, depth.bids).map(v => ({
                        price: v[0],
                        size: v[1],
                    })),
                    sell: splitEvery<number>(2, depth.asks).map(v => ({
                        price: v[0],
                        size: v[1],
                    })),
                })

            }
            else if (topic === 'trade') {

                const trade = d as {
                    ts: number
                    side: 'buy' | 'sell'
                    price: number
                    amount: number
                }

                this.tradeObservable.next({
                    symbol,
                    timestamp: trade.ts,
                    side: trade.side === 'buy' ? 'Buy' : 'Sell',
                    size: trade.amount,
                    price: trade.price,
                })
            }

        }
    }
}