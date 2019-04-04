export namespace BaseType {

    export type Omit<T, K extends string> = Pick<T, Exclude<keyof T, K>>



    export type BitmexSymbol = 'ETHUSD' | 'XBTUSD'
    export type BinanceSymbol = 'btcusdt' | 'ethusdt' //ws小写  http大写  卧槽
    export type HopexSymbol = 'BTCUSDT' | 'ETHUSDT' | 'BTCUSD' | 'ETHUSD'
    export type MarketAndSymbol = {
        market: 'bitmex'
        symbol: BitmexSymbol
    }
        |
    {
        market: 'binance'
        symbol: BinanceSymbol
    }
        |
    {
        market: 'hopex'
        symbol: HopexSymbol
    }




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

    export type 着笔 = {
        timestamp: number
        side: BaseType.Side,
        size: number,
        price: number,
        buy1: number,
        sell1: number
    }


    //binance
    export type Trade = { //着笔
        id: number
        timestamp: number
        price: number
        size: number //负数是卖
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
        成交性质?: 成交性质Type
    }


    export type 成交性质Type = '双开' | '双平' | '多换' | '空换' | '多平' | '空平' | '空开' | '多开' | '不知道'

    export type 成交记录 = {
        timestamp: number
        type: '挂单买' | '挂单卖' | '挂单买成功' | '挂单卖成功' | '市价买' | '市价卖'
        size: number
        price: number
        仓位数量: number
        开仓均价: number
        text: string
    }[]
} 