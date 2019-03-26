import { BaseType } from '../../BaseType'
import { JSONSync } from '../../F/JSONSync'
import { RealDataBase } from '../../../RealDataServer/RealDataBase'

export interface PositionAndOrder {

    //先写成这样  需要改  
    jsonSync: JSONSync<{
        wallet: {
            time: number
            total: number
        }[]
        symbol: {
            XBTUSD: {
                任务开关: {
                    自动开仓摸顶: boolean;
                    自动开仓抄底: boolean;
                    自动开仓追涨: boolean;
                    自动开仓追跌: boolean;
                    自动止盈波段: boolean;
                    自动推止损: boolean;
                };
                活动委托: {
                    type: '限价' | '限价只减仓' | '止损'
                    timestamp: number
                    id: string
                    side: BaseType.Side
                    cumQty: number      //成交数量
                    orderQty: number    //委托数量
                    price: number
                }[];
                仓位数量: number;
                开仓均价: number;
            };
            Hopex_BTC: {
                任务开关: {
                    自动开仓摸顶: boolean;
                    自动开仓抄底: boolean;
                    自动开仓追涨: boolean;
                    自动开仓追跌: boolean;
                    自动止盈波段: boolean;
                    自动推止损: boolean;
                };
                活动委托: {
                    type: '限价' | '限价只减仓' | '止损'
                    timestamp: number
                    id: string
                    side: BaseType.Side
                    cumQty: number      //成交数量
                    orderQty: number    //委托数量
                    price: number
                }[];
                仓位数量: number;
                开仓均价: number;
            };
            ETHUSD: {
                任务开关: {
                    自动开仓摸顶: boolean;
                    自动开仓抄底: boolean;
                    自动开仓追涨: boolean;
                    自动开仓追跌: boolean;
                    自动止盈波段: boolean;
                    自动推止损: boolean;
                };
                活动委托: {
                    type: '限价' | '限价只减仓' | '止损'
                    timestamp: number
                    id: string
                    side: BaseType.Side
                    cumQty: number      //成交数量
                    orderQty: number    //委托数量
                    price: number
                }[];
                仓位数量: number;
                开仓均价: number;
            };
        };
    }>

    get本地维护仓位数量(symbol: BaseType.BitmexSymbol): number

    realData: RealDataBase

    //hopex_API

    hopex_taker: (p: { size: number, side: BaseType.Side }) => boolean | Promise<boolean>

    hopex_stop: (p: { side: BaseType.Side, price: number }) => boolean | Promise<boolean>

    hopex_cancel: (p: { orderID: number }) => boolean | Promise<boolean>

    //API
    maker: (p: {
        symbol: BaseType.BitmexSymbol;
        side: BaseType.Side;
        size: number;
        price: () => number;
        reduceOnly: boolean;
        text: string;
    }, logText?: string) => boolean | Promise<boolean>

    stop: (p: {
        side: BaseType.Side;
        price: number;
    }) => boolean | Promise<boolean>

    updateStop: (p: {
        orderID: string;
        price: number;
    }) => boolean | Promise<boolean>

    updateMaker: (p: {
        orderID: string;
        price: () => number;
    }, logText?: string) => boolean | Promise<boolean>

    limit: (p: {
        symbol: BaseType.BitmexSymbol;
        side: BaseType.Side;
        size: number;
        price: () => number;
        text: string;
    }, logText?: string) => boolean | Promise<boolean>

    taker: (p: {
        symbol: BaseType.BitmexSymbol;
        side: BaseType.Side;
        size: number;
        text: string;
    }, logText?: string) => boolean | Promise<boolean>

    close: (p: {
        symbol: BaseType.BitmexSymbol;
        text: string;
    }, logText?: string) => boolean | Promise<boolean>

    cancel: (p: {
        orderID: string[];
        text: string;
    }, logText?: string) => boolean | Promise<boolean>

    runTask(task: PositionAndOrderTask): void

}

export interface PositionAndOrderTask {
    onTick(self: PositionAndOrder): boolean | Promise<boolean>
    onHopexTick(self: PositionAndOrder): boolean | Promise<boolean>
    onFilled(p: { symbol: BaseType.BitmexSymbol, type: '限价' | '限价只减仓' | '止损' | '强平' }): void
}