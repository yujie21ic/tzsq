import { BaseType } from '../BaseType'

export interface TradeAndOrderBook {

    readonly isConnected: boolean

    onStatusChange(): void

    onTrade(p: {
        symbol: string
        timestamp: number
        side: BaseType.Side
        size: number
        price: number
    }): void

    onOrderBook(p: {
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
    }): void



}
