import { TradeAndOrderBook } from './TradeAndOrderBook'
import { BaseType } from '../../BaseType'
import { config } from '../../../config'
import { WebSocketClient } from '../../F/WebSocketClient'
import { mapObjIndexed } from '../../F/mapObjIndexed'

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
    |
{
    method: 'price.update'
    timestamp: number
    data: {
        contractCode: BaseType.HopexSymbol
        fairPrice: string   //合理价格
        marketPrice: string //
    }
}


const head_data = (name: string) => ({
    'method': name + '.subscribe',
    'conversionCurrency': 'USD',
    'lang': 'cn',
    'packType': '1',
    'version': '1.0',
    'msgType': 'request',
    'timestamps': String(Date.now()),
    'serialNumber': '5',
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

// const deals_subscribe_data = (symbol: BaseType.HopexSymbol) => ({
//     'head': head_data('deals'),
//     'param': {
//         'lastId': -1, //猜的
//         'limit': 20,
//         'market': symbol,
//         'marketCode': symbol,
//         'contractCode': symbol,
//         'lang': 'cn'
//     }
// })

const price_subscribe_data = (symbol: BaseType.HopexSymbol) => ({
    'head': head_data('price'),
    'param': {
        lang: 'zh-CN',
        contractCode: symbol,
        market: symbol,
        marketCode: symbol,
    }
})

const createItem = () => ({
    sell: Object.create(null) as { [orderPrice: number]: number },
    buy: Object.create(null) as { [orderPrice: number]: number },
})

export class HopexTradeAndOrderBook extends TradeAndOrderBook<BaseType.HopexSymbol> {

    private wsArr = BaseType.HopexSymbolArr.map(symbol =>
        ({
            symbol,
            ws: new WebSocketClient({
                ss: config.ss,
                url: 'wss://api.hopex.com/ws'
            })
        })
    )

    private subscribe(ws: WebSocketClient, type: 'all' | 'trade' | 'order_book' = 'all', symbol: BaseType.HopexSymbol) {
        ws.onStatusChange = () => {
            if (ws.isConnected) {
                if (type === 'order_book' || type === 'all') {
                    ws.sendJSON(orderbook_subscribe_data(symbol))
                }
                if (type === 'trade' || type === 'all') {
                    // ws.sendJSON(deals_subscribe_data(symbol)) //着笔
                    ws.sendJSON(price_subscribe_data(symbol))    //合理价格
                }
            }
            this.statusObservable.next({
                isConnected: this.wsArr.every(v => v.ws.isConnected)
            })
        }
    }

    constructor(type: 'all' | 'trade' | 'order_book' = 'all') {
        super()

        this.wsArr.forEach(v => {
            this.subscribe(v.ws, type, v.symbol)
            v.ws.onData = this.onFrame
        })
    }

    private onFrame = (d: Frame) => {

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

        //合理价格
        if (d.method === 'price.update') {

            this.tradeObservable.next({
                symbol: d.data.contractCode,
                timestamp: Number(d.timestamp),
                side: 'Buy',
                size: 0,
                price: Number(d.data.fairPrice.split(',').join('')),     //居然返回字符串样式
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
                        price: Number(v.split(',').join('')),
                        size: obj.buy[Number(v.split(',').join(''))],
                    })),
                    sell: sell.slice(0, 5).map(v => ({
                        price: Number(v.split(',').join('')),
                        size: obj.sell[Number(v.split(',').join(''))],
                    })),
                })
            }
        }
    }

    private orderBook = mapObjIndexed(createItem, BaseType.HopexSymbolDic)
}