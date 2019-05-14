import { BaseType } from '../lib/BaseType'
import { Subject } from 'rxjs'

export class TradeAndOrderBook<T extends string = string> {

    statusObservable = new Subject<{
        isConnected: boolean
    }>()

    tradeObservable = new Subject<{
        symbol: T
        timestamp: number
        side: BaseType.Side
        size: number
        price: number
        成交性质?: BaseType.成交性质Type
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
