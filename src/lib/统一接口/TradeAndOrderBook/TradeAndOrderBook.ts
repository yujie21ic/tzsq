import { BaseType } from '../../BaseType'
import { Subject } from 'rxjs'

export class TradeAndOrderBook<T extends string> {

    get isConnected() {
        return false
    }

    onStatusChange = () => { }

    tradeObservable = new Subject<{
        symbol: T
        timestamp: number
        side: BaseType.Side
        size: number
        price: number
    }>()

    orderBookObservable = new Subject<{
        symbol: T
        timestamp: number
        buy: {
            price: number
            size: number
        }[]
        sell: {
            price: number
            size: number
        }[]
    }>()

}
