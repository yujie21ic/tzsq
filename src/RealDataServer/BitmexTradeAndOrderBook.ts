import { TradeAndOrderBook } from './TradeAndOrderBook'
import { BitMEXWS } from '../lib/BitMEX/BitMEXWS'
import { BaseType } from '../lib/BaseType'

const 盘口map = (v: any) => ({
    price: Number(v[0]),
    size: Number(v[1]),
})

export class BitmexTradeAndOrderBook extends TradeAndOrderBook<BaseType.BitmexSymbol> {

    private ws = new BitMEXWS('', [
        { theme: 'trade', filter: 'XBTUSD' },
        { theme: 'trade', filter: 'ETHUSD' },
        { theme: 'orderBook10', filter: 'XBTUSD' },
        { theme: 'orderBook10', filter: 'ETHUSD' },
        // { theme: 'tradeBin1m', filter: 'XBTUSD' },
        // { theme: 'tradeBin1m', filter: 'ETHUSD' },
    ])

    name = 'bitmex'

    constructor() {
        super()

        this.ws.onStatusChange = () => {
            this.statusObservable.next({ isConnected: this.ws.isConnected })
        }

        this.ws.onmessage = frame => {

            if (frame.table === 'tradeBin1m') {
                // console.log(JSON.stringify(frame, undefined, 4))
                // load 1m ?
            }

            //trade 只会插入新数据  不会更新
            if (frame.table === 'trade' && (frame.action === 'partial' || frame.action === 'insert')) {
                frame.data.forEach(({ symbol, side, size, price, timestamp }) => {
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