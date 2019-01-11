export namespace BaseType {
    export type BinanceSymbol = 'btcusdt' | 'ethusdt'
    export type BitmexSymbol = 'ETHUSD' | 'XBTUSD'
    export type Side = 'Buy' | 'Sell'
    export type OrderBook = { //订单薄
        id: number
        buy: {
            price: number
            size: number
        }[]
        sell: {
            price: number
            size: number
        }[]
    }
    export type OrderBookDB = { //订单薄
        id: number
        buy1_price: number
        buy1_size: number
        sell1_price: number
        sell1_size: number
        buy2_price: number
        buy2_size: number
        sell2_price: number
        sell2_size: number
        buy3_price: number
        buy3_size: number
        sell3_price: number
        sell3_size: number
        buy4_price: number
        buy4_size: number
        sell4_price: number
        sell4_size: number
        buy5_price: number
        buy5_size: number
        sell5_price: number
        sell5_size: number
    }
    export type Trade = { //着笔
        id: number
        timestamp: number
        price: number
        size: number
    }
    export type KLine = { //K线
        id: number
        open: number
        high: number
        low: number
        close: number
        buySize: number
        sellSize: number
        buyCount: number
        sellCount: number
    }
    export type Omit<T, K extends string> = Pick<T, Exclude<keyof T, K>>
} 