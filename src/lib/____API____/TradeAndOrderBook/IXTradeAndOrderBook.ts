import { TradeAndOrderBook } from './TradeAndOrderBook'
import { BaseType } from '../../BaseType'
import { config } from '../../../config'
import { WebSocketClient } from '../../F/WebSocketClient'


type 着笔 = {
    'code': number,
    'data': {
        'time': number
        'side': 'buy' | 'sell'
        'values': [
            string,         // 成交价
            string,         // 成交量
        ]
    }[]
}

type 盘口 = {
    'code': 0,
    'data': {
        'asks': {
            'values': [
                string,      // 卖价
                string,      // 卖量
            ]
        }[]
        'bids': {
            'values': [
                string,      // 卖价
                string,      // 卖量
            ]
        }[]
    }
}

const 盘口map = (v: any) => ({
    price: Number(v[0]),
    size: Number(v[1]),
})

export class IXTradeAndOrderBook extends TradeAndOrderBook {

    private 着笔ws = new WebSocketClient({
        ss: config.ss,
        url: `wss://ws.ix.com/v1/deal/FUTURE_BTCUSD`,
    })

    private 盘口ws = new WebSocketClient({
        ss: config.ss,
        url: `wss://ws.ix.com/v1/orderbook/FUTURE_BTCUSD/0/1/5`,
    })

    constructor() {
        super()

        this.着笔ws.onStatusChange = this.盘口ws.onStatusChange = () => {
            this.statusObservable.next({
                isConnected: this.着笔ws.isConnected && this.盘口ws.isConnected
            })
        }


        this.着笔ws.onData = (d: 着笔) => {
            d.data.forEach(v => {
                this.tradeObservable.next({
                    symbol: 'BTCUSD',
                    timestamp: v.time,
                    price: Number(v.values[0]),
                    side: v.side === 'sell' ? 'Sell' : 'Buy',
                    size: Number(v.values[1]),
                })
            })
        }

        this.盘口ws.onData = (d: 盘口) => {
            this.orderBookObservable.next({
                symbol: 'BTCUSD',
                timestamp: Date.now(),//直接读取本地时间
                buy: d.data.bids.map(盘口map),
                sell: d.data.asks.map(盘口map),
            })
        }


    }

}