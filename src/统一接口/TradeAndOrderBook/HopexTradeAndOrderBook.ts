import { TradeAndOrderBook } from './TradeAndOrderBook'
import { BaseType } from '../../lib/BaseType'
import { config } from '../../config'
import { WebSocketClient } from '../../lib/C/WebSocketClient'

type Frame = {
    method: 'orderbook.update'
    timestamp: number
    data: {
        contractCode: BaseType.HopexSymbol
        asksFilter: string
        asks: {
            priceD: number
            orderPrice: string
            orderQuantity: number
            orderQuantityShow: string
            exist: number
        }[]
        bidsFilter: string
        bids: {
            priceD: number
            orderPrice: string
            orderQuantity: number
            orderQuantityShow: string
            exist: number
        }[]
    }
}
    |
{
    method: 'deals.update'
    timestamp: number
    data: {
        id: number
        contractCode: BaseType.HopexSymbol
        time: string
        fillPrice: string
        fillQuantity: string
        side: string            // 1 Sell    2 Buy
    }[]
}


const head_data = (name: string) => ({
    'method': name + '.subscribe',
    'conversionCurrency': 'USD',
    'lang': 'cn',
    'packType': '1',
    'version': '1.0',
    'msgType': 'request',
    'timestamps': String(Date.now()),
    'serialNumber': '5'
})

const orderbook_subscribe_data = (symbol: BaseType.HopexSymbol) => (
    {
        'head': head_data('orderbook'),
        'param': {
            'market': symbol,
            'marketCode': symbol,
            'contractCode': symbol,
            'lang': 'cn'
        }
    }
)

const deals_subscribe_data = (symbol: BaseType.HopexSymbol) => ({
    'head': head_data('deals'),
    'param': {
        'lastId': -1, //猜的
        'limit': 20,
        'market': symbol,
        'marketCode': symbol,
        'contractCode': symbol,
        'lang': 'cn'
    }
})

export class HopexTradeAndOrderBook extends TradeAndOrderBook<BaseType.HopexSymbol> {

    private ws = new WebSocketClient({
        ss: config.ss,
        url: 'wss://api.hopex.com/ws'
    })

    constructor(type: 'all' | 'trade' | 'order_book' = 'all') {
        super()

        this.ws.onStatusChange = () => {
            if (this.ws.isConnected) {
                if (type === 'order_book' || type === 'all') {
                    this.ws.sendJSON(orderbook_subscribe_data('BTCUSDT'))
                    // this.ws.sendJSON(orderbook_subscribe_data('ETHUSDT'))  
                }
                if (type === 'trade' || type === 'all') {
                    this.ws.sendJSON(deals_subscribe_data('BTCUSDT'))
                    // this.ws.sendJSON(deals_subscribe_data('ETHUSDT'))
                }
            }
            this.statusObservable.next({ isConnected: this.ws.isConnected })
        }

        this.ws.onData = (d: Frame) => {

            //着笔
            if (d.method === 'deals.update') {
                d.data.forEach(v => {
                    this.tradeObservable.next({
                        symbol: v.contractCode,
                        timestamp: Number(d.timestamp),
                        side: v.side === '1' ? 'Sell' : 'Buy',
                        size: Number(v.fillQuantity.split(',').join('')),   //居然返回字符串样式
                        price: Number(v.fillPrice.split(',').join('')),     //居然返回字符串样式
                    })
                })
            }

            // //盘口
            if (d.method === 'orderbook.update') {
                const obj = this.orderBook[d.data.contractCode]

                d.data.asks.forEach(v => {
                    const price = Number(v.orderPrice)
                    const size = v.orderQuantity

                    if (size === 0) {
                        delete obj.sell[price]
                    } else {
                        obj.sell[price] = size
                    }
                })

                d.data.bids.forEach(v => {
                    const price = Number(v.orderPrice)
                    const size = v.orderQuantity

                    if (size === 0) {
                        delete obj.buy[price]
                    } else {
                        obj.buy[price] = size
                    }
                })

                const buy = Object.keys(obj.buy).sort((a, b) => Number(b) - Number(a))
                const sell = Object.keys(obj.sell).sort()

                if (buy.length >= 5 && sell.length >= 5) {

                    //删除50以上的
                    buy.slice(50).forEach(v => delete obj.buy[Number(v)])
                    sell.slice(50).forEach(v => delete obj.sell[Number(v)])

                    this.orderBookObservable.next({
                        symbol: d.data.contractCode,
                        timestamp: Number(d.timestamp),
                        buy: buy.slice(0, 5).map(v => ({
                            price: Number(v),
                            size: obj.buy[Number(v)],
                        })),
                        sell: sell.slice(0, 5).map(v => ({
                            price: Number(v),
                            size: obj.sell[Number(v)],
                        })),
                    })
                }
            }
        }
    }

    private orderBook = {
        BTCUSDT: {
            sell: Object.create(null) as { [orderPrice: number]: number },
            buy: Object.create(null) as { [orderPrice: number]: number },
        },
        ETHUSDT: {
            sell: Object.create(null) as { [orderPrice: number]: number },
            buy: Object.create(null) as { [orderPrice: number]: number },
        }
    }
}