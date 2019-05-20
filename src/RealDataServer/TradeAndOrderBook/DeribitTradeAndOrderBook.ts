import { TradeAndOrderBook } from './TradeAndOrderBook'
import { BaseType } from '../../lib/BaseType'
import { WebSocketClient } from '../../lib/F/WebSocketClient'
import { config } from '../../config'
import { createHash } from 'crypto'


const AccessKey = '6DyqXnNq9Ufxr'
const AccessSecret = 'PRBFU6OORBVDPVYFRDKGPDLJQTCFFXGS'

const serialize = (m: any) =>
    Object.keys(m)
        .sort()
        .map(k => (Array.isArray(m[k]) ? `${k}=${m[k].join('')}` : `${k}=${m[k]}`))
        .join('&')


const sig = (action: string, obj: any) => {
    const time = Date.now()
    const hash = createHash('sha256')
    hash.update(
        serialize({
            ...obj,
            _: time,
            _ackey: AccessKey,
            _acsec: AccessSecret,
            _action: action,
        })
    )
    const sig = `${AccessKey}.${time}.${hash.digest('base64')}`
    return sig
}

const privateAction = (action: string, obj: any) => (
    {
        'id': 1234,
        'action': action,
        'arguments': obj,
        'sig': sig(action, obj),
    }
)


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
                this.ws.sendJSON(
                    privateAction('/api/v1/private/subscribe', {
                        'instrument': ['BTC-PERPETUAL'],
                        'event': ['order_book', 'trade'],
                    })
                )
            }
        }

        this.ws.onData = data => {
            console.log('data', data)
        }

    }
}
