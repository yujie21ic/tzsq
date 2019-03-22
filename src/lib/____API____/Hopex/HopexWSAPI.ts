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

export class HopexTradeAndOrderBook {

    private ws = new WebSocketClient({
        ss: config.ss,
        url: 'wss://api.hopex.com/ws'
    })

    constructor(type: 'all' | 'trade' | 'order_book' = 'all') {

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
        }

        this.ws.onData = (d: Frame) => {

            //着笔
            if (d.method === 'deals.update') {
                d.data.forEach(v => {
                })
            }

        }
    }

}