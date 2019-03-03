import { BaseType } from '../../lib/BaseType'
import { JSONSync } from '../../lib/C/JSONSync'
import { RealDataBase } from '../../RealDataServer/RealDataBase'

export interface PositionAndOrder {

    //先写成这样  需要改  
    jsonSync: JSONSync<{
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

    //
    get本地维护仓位数量(symbol: BaseType.BitmexSymbol): number

    realData: RealDataBase


    //API
    maker: (p: {
        symbol: BaseType.BitmexSymbol;
        side: BaseType.Side;
        size: number;
        price: () => number;
        reduceOnly: boolean;
        text: string;
    }, logText?: string) => Promise<boolean>

    stop: (p: {
        symbol: BaseType.BitmexSymbol;
        side: BaseType.Side;
        price: number;
        text: string;
    }, logText?: string) => Promise<boolean>

    updateStop: (p: {
        orderID: string;
        price: number;
    }, logText?: string) => Promise<boolean>

    updateMaker: (p: {
        orderID: string;
        price: () => number;
    }, logText?: string) => Promise<boolean>

    limit: (p: {
        symbol: BaseType.BitmexSymbol;
        side: BaseType.Side;
        size: number;
        price: () => number;
        text: string;
    }, logText?: string) => Promise<boolean>

    taker: (p: {
        symbol: BaseType.BitmexSymbol;
        side: BaseType.Side;
        size: number;
        text: string;
    }, logText?: string) => Promise<boolean>

    close: (p: {
        symbol: BaseType.BitmexSymbol;
        text: string;
    }, logText?: string) => Promise<boolean>

    cancel: (p: {
        orderID: string[];
        text: string;
    }, logText?: string) => Promise<boolean>

    runTask(task: PositionAndOrderTask): Promise<void>

    get浮盈点数(symbol: BaseType.BitmexSymbol): number

}

export interface PositionAndOrderTask {
    onTick(self: PositionAndOrder): Promise<boolean>
    onFilled(p: { symbol: BaseType.BitmexSymbol, type: '限价' | '限价只减仓' | '止损' | '强平' }): void
}