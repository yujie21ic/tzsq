import { TradeAndOrderBook } from './TradeAndOrderBook'
import { BaseType } from '../../BaseType'
import { config } from '../../../config'
import { WebSocketClient } from '../../C/WebSocketClient'

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

// const orderbook_subscribe_data = (symbol: BaseType.HopexSymbol) => (
//     {
//         'head': head_data('orderbook'),
//         'param': {
//             'market': symbol,
//             'marketCode': symbol,
//             'contractCode': symbol,
//             'lang': 'cn'
//         }
//     }
// )

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

    constructor() {
        super()

        this.ws.onStatusChange = () => {
            if (this.ws.isConnected) {
                // 盘口懒得写了
                // this.ws.sendJSON(orderbook_subscribe_data('BTCUSDT'))
                // this.ws.sendJSON(orderbook_subscribe_data('ETHUSDT'))
                this.ws.sendJSON(deals_subscribe_data('BTCUSDT'))
                this.ws.sendJSON(deals_subscribe_data('ETHUSDT'))
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
            // if (d.method === 'orderbook.update') {
            //     const obj = this.orderBook[d.data.contractCode]

            //     d.data.asks.forEach(v => {
            //         const price = Number(v.orderPrice)
            //         const size = v.orderQuantity
            //         obj.sell[price] = size
            //     })

            //     d.data.bids.forEach(v => {
            //         const price = Number(v.orderPrice)
            //         const size = v.orderQuantity
            //         obj.buy[price] = size
            //     })

            //     this.orderBookObservable.next({
            //         symbol: d.data.contractCode,
            //         timestamp: Number(d.timestamp),
            //         buy: [],
            //         sell: [],
            //     })
            // }
        }
    }

    // orderBook = {
    //     BTCUSDT: {
    //         最小间隔: 0.5,
    //         sellMin: NaN,
    //         sell: Object.create(null) as { [orderPrice: number]: number },
    //         buyMax: NaN,
    //         buy: Object.create(null) as { [orderPrice: number]: number },
    //     },
    //     ETHUSDT: {
    //         最小间隔: 0.05,
    //         sellMin: NaN,
    //         sell: Object.create(null) as { [orderPrice: number]: number },
    //         buyMax: NaN,
    //         buy: Object.create(null) as { [orderPrice: number]: number },
    //     }
    // }
}