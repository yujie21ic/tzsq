import { TradeAndOrderBook } from './TradeAndOrderBook'
import { config } from '../../../config'
import { WebSocketClient } from '../../F/WebSocketClient'
import { BaseType } from '../../BaseType'


type Frame = {
    'code': number,
    'data': {
        'time': number
        'side': 'buy' | 'sell'
        'values': string[]   //成交价      成交量
    }[]
}


export class BitfinexTradeAndOrderBook extends TradeAndOrderBook<BaseType.BitfinexSymbol> {

    private ws = new WebSocketClient({
        ss: config.ss,
        url: `wss://api-pub.bitfinex.com/ws/2`,
    })


    constructor() {
        super()

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

        this.ws.onData = (d: Frame) => {

        }



    }
}