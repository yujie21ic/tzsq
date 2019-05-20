import { TradeAndOrderBook } from './TradeAndOrderBook'
import { BaseType } from '../../lib/BaseType'
import { WebSocketClient } from '../../lib/F/WebSocketClient'
import { config } from '../../config'

export class DeribitTradeAndOrderBook extends TradeAndOrderBook<BaseType.BitmexSymbol> {

    name = 'deribit'

    private ws = new WebSocketClient({
        name: 'deribit ws',
        ss: config.ss,
        url: 'wss://www.deribit.com/ws/api/v1/',
    })

    constructor() {
        super()

        this.ws.onStatusChange = () => {
            this.statusObservable.next({ isConnected: this.ws.isConnected })

            if (this.ws.isConnected) {
                this.ws.sendJSON({
                    'id': 1234,
                    'action': '/api/v1/private/subscribe',
                    'arguments': {
                        'instrument': ['BTC-PERPETUAL'],
                        'event': ['order_book', 'trade'],
                    },
                    'sig': '??????????????????????????????',
                })
            }
        }

        this.ws.onData = data => {
            console.log('data', data)
        }

    }
}
