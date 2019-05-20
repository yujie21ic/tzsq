import { TradeAndOrderBook } from './TradeAndOrderBook'
import { config } from '../../config'
import { WebSocketClient } from '../../lib/F/WebSocketClient'
import { BaseType } from '../../lib/BaseType'


type 着笔 = {
    'code': number,
    'data': {
        'time': number
        'side': 'buy' | 'sell'
        'values': string[]   //成交价      成交量
    }[]
}

type 盘口 = {
    'code': number,
    'data': {
        'asks': {
            'values': string[]   // 卖价    卖量     
        }[]
        'bids': {
            'values': string[]  // 卖价     卖量          
        }[]
    }
}

const 盘口map = (v: { values: string[] }) => ({
    price: Number(v.values[0]),
    size: Number(v.values[1]),
})

export class IXTradeAndOrderBook extends TradeAndOrderBook<BaseType.IXSymbol> {

    private 着笔ws = new WebSocketClient({
        name: 'IXTradeAndOrderBook 着笔ws',
        ss: config.ss,
        url: 'wss://ws.ix.com/v1/deal/FUTURE_BTCUSD',
    })

    private 盘口ws = new WebSocketClient({
        name: 'IXTradeAndOrderBook 盘口ws',
        ss: config.ss,
        url: 'wss://ws.ix.com/v1/orderbook/FUTURE_BTCUSD/0/1/5',
    })

    name = 'ix'

    constructor() {
        super()

        this.着笔ws.onStatusChange = this.盘口ws.onStatusChange = () => {
            this.statusObservable.next({
                isConnected: this.着笔ws.isConnected && this.盘口ws.isConnected
            })
        }


        this.着笔ws.onData = (d: 着笔) => {
            if (d.code === 0)
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
            if (d.code === 0)
                this.orderBookObservable.next({
                    symbol: 'BTCUSD',
                    timestamp: Date.now(),//直接读取本地时间
                    buy: d.data.bids.map(盘口map),
                    sell: d.data.asks.map(盘口map),
                })
        }


    }

}