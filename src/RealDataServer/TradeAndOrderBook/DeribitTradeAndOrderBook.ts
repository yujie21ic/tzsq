import { TradeAndOrderBook } from './TradeAndOrderBook'
import { BaseType } from '../../lib/BaseType'
import { WebSocketClient } from '../../lib/F/WebSocketClient'
import { config } from '../../config'
import { createHash } from 'crypto'

type Order = {
    quantity: number
    amount: number
    price: number
    cm: number
    cm_amount: number
}

type Frame = {
    notifications?: Array<
        {
            message: 'order_book_event'
            result: {
                instrument: 'BTC-PERPETUAL' | 'ETH-PERPETUAL'
                tstamp: number
                ask: Order[]
                bid: Order[]
            }
        }
        |
        {
            message: 'trade_event'
            result: {
                instrument: 'BTC-PERPETUAL' | 'ETH-PERPETUAL'
                timeStamp: number
                price: number
                quantity: number
                amount: number
                direction: 'buy' | 'sell'
            }[]
        }
    >
}


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


export class DeribitTradeAndOrderBook extends TradeAndOrderBook<BaseType.DeribitSymbol> {

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
                        'instrument': ['BTC-PERPETUAL', 'ETH-PERPETUAL'],
                        'event': ['order_book', 'trade'],
                    })
                )
            }
        }

        this.ws.onData = (data: Frame) => {

            if (data.notifications === undefined) return

            data.notifications.forEach(v => {
                if (v.message === 'order_book_event') {
                    const item = v.result
                    this.orderBookObservable.next({
                        symbol: item.instrument === 'BTC-PERPETUAL' ? 'BTC_PERPETUAL' : 'ETH_PERPETUAL',
                        timestamp: item.tstamp,
                        buy: item.bid.map(v => ({
                            price: v.price,
                            size: v.amount,//<------------------------
                        })).slice(0, 5),
                        sell: item.ask.map(v => ({
                            price: v.price,
                            size: v.amount,//<------------------------
                        })).slice(0, 5),
                    })
                }
                else if (v.message === 'trade_event') {
                    v.result.forEach(item => {
                        this.tradeObservable.next({
                            symbol: item.instrument === 'BTC-PERPETUAL' ? 'BTC_PERPETUAL' : 'ETH_PERPETUAL',
                            timestamp: item.timeStamp,
                            side: item.direction === 'buy' ? 'Buy' : 'Sell',
                            size: item.amount,//<------------------------
                            price: item.price,
                        })
                    })
                }
            })
        }

    }
}
