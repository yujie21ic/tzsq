import { keys } from 'ramda'

export namespace BaseType {

    export type Omit<T, K extends string> = Pick<T, Exclude<keyof T, K>>


    //bitmex
    export const BitmexSymbolDic = {
        'XBTUSD': {},
        'ETHUSD': {},
    }
    export type BitmexSymbol = keyof typeof BitmexSymbolDic
    export const BitmexSymbolArr = keys(BitmexSymbolDic)


    //deribit
    export const DeribitSymbolDic = {
        'BTC_PERPETUAL': {},
        'ETH_PERPETUAL': {},
    }
    export type DeribitSymbol = keyof typeof DeribitSymbolDic
    export const DeribitSymbolArr = keys(DeribitSymbolDic)


    //hopex
    export const HopexSymbolDic = {
        'BTCUSDT': {},
        'ETHUSDT': {},
        'LTCUSDT': {},
    }
    export type HopexSymbol = keyof typeof HopexSymbolDic
    export const HopexSymbolArr = keys(HopexSymbolDic)

    //binance
    export const BinanceSymbolDic = {
        'btcusdt': {},
        'ethusdt': {},
    }
    export type BinanceSymbol = keyof typeof BinanceSymbolDic
    export const BinanceSymbolArr = keys(BinanceSymbolDic)


    //ctp
    export const CTPSymbolDic = {
        'rb1910': {},
        'TA909': {},
        'i1909': {},
        'MA909': {},
        'SR909': {},
    }
    export type CTPSymbol = keyof typeof CTPSymbolDic
    export const CTPSymbolArr = keys(CTPSymbolDic)

    //ix
    export const IXSymbolDic = {
        'BTCUSD': {}
    }
    export type IXSymbol = keyof typeof IXSymbolDic
    export const IXSymbolArr = keys(IXSymbolDic)



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


    export type Order = {
        type: '限价' | '限价只减仓' | '止损'
        timestamp: number
        id: string
        side: BaseType.Side
        cumQty: number      //成交数量
        orderQty: number    //委托数量
        price: number
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


} 