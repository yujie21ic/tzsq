import { BaseType } from '../../BaseType'
import { JSONSync } from '../../F/JSONSync'
import { RealDataBase } from '../../../RealDataServer/RealDataBase'

type ITEM = {
    任务开关: {
        自动开仓摸顶: boolean
        自动开仓抄底: boolean
        自动开仓追涨: boolean
        自动开仓追跌: boolean
        自动止盈波段: boolean
        自动止损: boolean
        自动推止损: boolean
    }
    委托列表: {
        type: '限价' | '限价只减仓' | '止损'
        timestamp: number
        id: string
        side: BaseType.Side
        cumQty: number      //成交数量
        orderQty: number    //委托数量
        price: number
    }[]
    仓位数量: number
    开仓均价: number
}

export interface PositionAndOrder {

    //先写成这样  需要改  
    jsonSync: JSONSync<{
        wallet: {
            time: number
            total: number
        }[]
        任务: {
            名字: string
            开关: boolean
            参数: string
        }[]
        market: {
            hopex: {
                [K in keyof typeof BaseType.HopexSymbolDic]: ITEM
            }
            fcoin: {
                btcusdt: ITEM
                ethusdt: ITEM
            },
            bitmex: {
                XBTUSD: ITEM
                ETHUSD: ITEM
            },
        }
    }>

    log(text: string): void

    get本地维护仓位数量(symbol: BaseType.BitmexSymbol): number

    realData: RealDataBase

    //hopex_API

    hopex_taker: (p: { symbol: BaseType.HopexSymbol, size: number, side: BaseType.Side }) => boolean | Promise<boolean>

    hopex_stop: (p: { symbol: BaseType.HopexSymbol, side: BaseType.Side, price: number }) => boolean | Promise<boolean>

    hopex_cancel: (p: { symbol: BaseType.HopexSymbol, orderID: string }) => boolean | Promise<boolean>

    //API
    maker: (p: {
        symbol: BaseType.BitmexSymbol
        side: BaseType.Side
        size: number
        price: () => number
        reduceOnly: boolean
        text: string
    }) => boolean | Promise<boolean>

    maker多个: (p: {
        symbol: BaseType.BitmexSymbol;
        arr: { side: BaseType.Side, price: number, size: number, reduceOnly: boolean }[]
    }) => boolean | Promise<boolean>

    stop: (p: {
        side: BaseType.Side
        price: number
    }) => boolean | Promise<boolean>

    updateStop: (p: {
        orderID: string
        price: number
    }) => boolean | Promise<boolean>

    updateMaker: (p: {
        orderID: string
        price: () => number
    }) => boolean | Promise<boolean>

    limit: (p: {
        symbol: BaseType.BitmexSymbol
        side: BaseType.Side
        size: number
        price: () => number
        text: string
    }) => boolean | Promise<boolean>

    taker: (p: {
        symbol: BaseType.BitmexSymbol
        side: BaseType.Side
        size: number
        text: string
    }) => boolean | Promise<boolean>

    close: (p: {
        symbol: BaseType.BitmexSymbol
        text: string
    }) => boolean | Promise<boolean>

    cancel: (p: {
        orderID: string[]
    }) => boolean | Promise<boolean>

    runTask(task: PositionAndOrderTask): void

}

export interface PositionAndOrderTask {
    onTick(self: PositionAndOrder): boolean | Promise<boolean>
    onHopexTick(self: PositionAndOrder): boolean | Promise<boolean>
    onFilled(p: {
        symbol: BaseType.BitmexSymbol
        side: BaseType.Side
        price: number
        size: number
        type: '限价' | '限价只减仓' | '止损' | '强平'
    }): void
}