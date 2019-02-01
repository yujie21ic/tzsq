import { BaseType } from '../BaseType'

export class TradeAndOrderBook {

    get isConnected() {
        return false
    }

    onStatusChange = () => { }

    onTrade = (p: {
        symbol: string
        timestamp: number
        side: BaseType.Side
        size: number
        price: number
    }) => { }

    onOrderBook = (p: {
        symbol: string
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
