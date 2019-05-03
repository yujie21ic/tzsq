import { TradeAndOrderBook } from './TradeAndOrderBook'
import { config } from '../../../config'
import { WebSocketClient } from '../../F/WebSocketClient'
import { BaseType } from '../../BaseType'



export class BitfinexTradeAndOrderBook extends TradeAndOrderBook<BaseType.BitfinexSymbol> {

    private ws = new WebSocketClient({
        ss: config.ss,
        url: `wss://api-pub.bitfinex.com/ws/2`,
    })


    constructor() {
        super()

        setInterval(() => {
            if (this.ws.isConnected) {
                this.ws.sendJSON({
                    'event': 'ping',
                    'cid': Date.now(),
                })
            }
        }, 1000)


        this.ws.onStatusChange = () => {
            this.statusObservable.next({
                isConnected: this.ws.isConnected
            })

            if (this.ws.isConnected) {
                this.ws.sendJSON({
                    event: 'subscribe',
                    channel: 'trades',
                    symbol: 'tBTCUSD'
                })
            }
        }

        this.ws.onData = (d: any) => {
            // console.log(JSON.stringify(d, null, 4))

            //
            if (Array.isArray(d) && d.length === 3 && d[1] === 'te' && Array.isArray(d[2])) {
                const [, mts, amount, price] = d[2]

                this.tradeObservable.next({
                    symbol: 'BTCUSD',
                    timestamp: mts,
                    price,
                    side: amount > 0 ? 'Buy' : 'Sell',
                    size: Math.abs(amount),
                })
            }

        }



    }
}