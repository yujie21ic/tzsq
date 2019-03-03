import { PositionAndOrder, PositionAndOrderTask } from './PositionAndOrder'
import { DataClient } from '../../RealDataServer/DataClient'
import { createJSONSync } from './BitmexPositionAndOrder'
import { BaseType } from '../../lib/BaseType'

export class 回测PositionAndOrder implements PositionAndOrder {

    realData: DataClient.RealData__History

    jsonSync = createJSONSync()

    get本地维护仓位数量(symbol: BaseType.BitmexSymbol): number {
        return this.jsonSync.rawData.symbol[symbol].仓位数量
    }

    //重复
    get浮盈点数(symbol: BaseType.BitmexSymbol) {
        const 最新价 = this.realData.期货价格dic.get(symbol)
        if (最新价 === undefined) return NaN
        const { 仓位数量, 开仓均价 } = this.jsonSync.rawData.symbol[symbol]
        if (仓位数量 === 0) return NaN
        if (仓位数量 > 0) {
            return 最新价 - 开仓均价
        } else if (仓位数量 < 0) {
            return 开仓均价 - 最新价
        } else {
            return 0
        }
    }


    private startTime: number
    private endTime: number
    constructor(startTime: number, endTime: number) {
        this.startTime = startTime
        this.endTime = endTime
        this.realData = new DataClient.RealData__History()
    }


    async maker(p: {
        symbol: BaseType.BitmexSymbol;
        side: BaseType.Side;
        size: number;
        price: () => number;
        reduceOnly: boolean;
        text: string;
    }, logText?: string) {
        return false
    }

    async stop(p: {
        symbol: BaseType.BitmexSymbol;
        side: BaseType.Side;
        price: number;
        text: string;
    }, logText?: string) {
        return false
    }

    async updateStop(p: {
        orderID: string;
        price: number;
    }, logText?: string) {
        return false
    }

    async updateMaker(p: {
        orderID: string;
        price: () => number;
    }, logText?: string) {
        return false
    }

    async limit(p: {
        symbol: BaseType.BitmexSymbol;
        side: BaseType.Side;
        size: number;
        price: () => number;
        text: string;
    }, logText?: string) {
        return false
    }

    async taker(p: {
        symbol: BaseType.BitmexSymbol;
        side: BaseType.Side;
        size: number;
        text: string;
    }, logText?: string) {
        return false
    }

    async close(p: {
        symbol: BaseType.BitmexSymbol;
        text: string;
    }, logText?: string) {
        return false
    }

    async cancel(p: {
        orderID: string[];
        text: string;
    }, logText?: string) {
        return false
    }

    async runTask(task: PositionAndOrderTask) {
        this.realData.回测load(this.startTime, this.endTime)
        // this.ws.filledObservable.subscribe(v => task.onFilled(v))
        while (true) {
            this.realData.回测step()
            await task.onTick(this)
        }
    }

} 