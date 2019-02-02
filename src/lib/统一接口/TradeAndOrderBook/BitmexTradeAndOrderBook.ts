import { TradeAndOrderBook } from './TradeAndOrderBook'
import { BitMEXWSAPI } from '../../BitMEX/BitMEXWSAPI'
import { BaseType } from '../../BaseType'

const 盘口map = (v: any) => ({
    price: Number(v[0]),
    size: Number(v[1]),
})

export class BitmexTradeAndOrderBook extends TradeAndOrderBook<BaseType.BitmexSymbol> {

    private ws = new BitMEXWSAPI('', [
        { theme: 'trade', filter: 'XBTUSD' },
        { theme: 'trade', filter: 'ETHUSD' },
        { theme: 'orderBook10', filter: 'XBTUSD' },
        { theme: 'orderBook10', filter: 'ETHUSD' },
    ])

    get isConnected() {
        return this.ws.isConnected
    }

    constructor() {
        super()

        this.ws.onStatusChange = () => {
            this.onStatusChange()
        }

        this.ws.onmessage = frame => {

            //trade 只会插入新数据  不会更新
            if (frame.table === 'trade' && (frame.action === 'partial' || frame.action === 'insert')) {
                frame.data.forEach(({ symbol, side, size, price, timestamp }) => {
                    this.onTrade({
                        symbol: symbol as BaseType.BitmexSymbol,
                        timestamp: new Date(timestamp).getTime(),
                        side: side as BaseType.Side,
                        size,
                        price,
                    })
                    this.tradeObservable.next({
                        symbol: symbol as BaseType.BitmexSymbol,
                        timestamp: new Date(timestamp).getTime(),
                        side: side as BaseType.Side,
                        size,
                        price,
                    })
                })
            }

            //服务器bug  
            //partial 了2次 orderBook10  keys 都是 symbol   
            //然后 update
            if (frame.table === 'orderBook10' && (frame.action === 'partial' || frame.action === 'update')) {
                const { symbol, bids, asks, timestamp } = frame.data[0]
                this.onOrderBook({
                    symbol: symbol as BaseType.BitmexSymbol,
                    timestamp: new Date(timestamp).getTime(),
                    buy: bids.map(盘口map).slice(0, 5),
                    sell: asks.map(盘口map).slice(0, 5),
                })
                this.orderBookObservable.next({
                    symbol: symbol as BaseType.BitmexSymbol,
                    timestamp: new Date(timestamp).getTime(),
                    buy: bids.map(盘口map).slice(0, 5),
                    sell: asks.map(盘口map).slice(0, 5),
                })
            }
        }
    }
}