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
            if (this.ws.isConnected) {
                this.ws.sendJSON({
                    'id': 1234,
                    'action': '/api/v1/public/getorderbook',
                    'arguments': {
                        'instrument': ['futures'],
                        'event': ['order_book', 'trade'],
                    },
                })
            }
        }

        this.ws.onData = data => {
            console.log('data', data)
        }

    }
}
