import { BaseType } from '../BaseType'

export class TradeAndOrderBook<T extends string> {

    get isConnected() {
        return false
    }

    onStatusChange = () => { }

    onTrade = (p: {
        symbol: T
        timestamp: number
        side: BaseType.Side
        size: number
        price: number
    }) => { }

    onOrderBook = (p: {
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
    }) => { } 

}
