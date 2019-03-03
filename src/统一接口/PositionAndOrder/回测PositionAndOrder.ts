import { PositionAndOrder, PositionAndOrderTask } from './PositionAndOrder'
import { DataClient } from '../../RealDataServer/DataClient'
import { createJSONSync } from './BitmexPositionAndOrder'
import { BaseType } from '../../lib/BaseType'

export class 回测PositionAndOrder implements PositionAndOrder {

    realData: DataClient.RealData__History

    jsonSync = createJSONSync() //不支持 subject.subscribe

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

        //临时
        this.jsonSync.rawData.symbol.XBTUSD.任务开关.自动开仓抄底 = true
        this.jsonSync.rawData.symbol.XBTUSD.任务开关.自动开仓摸顶 = true
        this.jsonSync.rawData.symbol.XBTUSD.任务开关.自动开仓追涨 = true
        this.jsonSync.rawData.symbol.XBTUSD.任务开关.自动开仓追跌 = true
        this.jsonSync.rawData.symbol.XBTUSD.任务开关.自动推止损 = true
        this.jsonSync.rawData.symbol.XBTUSD.任务开关.自动止盈波段 = true
    }


    private order_id = 1234

    async maker(p: {
        symbol: BaseType.BitmexSymbol;
        side: BaseType.Side;
        size: number;
        price: () => number;
        reduceOnly: boolean;
        text: string;
    }, logText?: string) {
        if (p.symbol !== 'XBTUSD') return false

        this.jsonSync.rawData.symbol.XBTUSD.活动委托.push({
            type: p.reduceOnly ? '限价只减仓' : '限价',
            timestamp: Date.now(),
            id: String(this.order_id++),
            side: p.side,
            cumQty: 0,
            orderQty: p.size,
            price: p.price(),
        })

        return true
    }

    async stop(p: {
        symbol: BaseType.BitmexSymbol;
        side: BaseType.Side;
        price: number;
        text: string;
    }, logText?: string) {
        if (p.symbol !== 'XBTUSD') return false

        this.jsonSync.rawData.symbol.XBTUSD.活动委托.push({
            type: '止损',
            timestamp: Date.now(),
            id: String(this.order_id++),
            side: p.side,
            cumQty: 0,
            orderQty: 100000,
            price: p.price,
        })

        return true
    }

    async updateStop(p: {
        orderID: string;
        price: number;
    }, logText?: string) {

        this.jsonSync.rawData.symbol.XBTUSD.活动委托 = this.jsonSync.rawData.symbol.XBTUSD.活动委托.map(v => {
            if (v.id === p.orderID) {
                return { ...v, price: p.price }
            } else {
                return v
            }
        })

        return true
    }

    async updateMaker(p: {
        orderID: string;
        price: () => number;
    }, logText?: string) {

        this.jsonSync.rawData.symbol.XBTUSD.活动委托 = this.jsonSync.rawData.symbol.XBTUSD.活动委托.map(v => {
            if (v.id === p.orderID) {
                return { ...v, price: p.price() }
            } else {
                return v
            }
        })

        return true
    }

    async limit(p: {
        symbol: BaseType.BitmexSymbol;
        side: BaseType.Side;
        size: number;
        price: () => number;
        text: string;
    }, logText?: string) {
        if (p.symbol !== 'XBTUSD') return false

        //直接成交

        return true
    }

    async taker(p: {
        symbol: BaseType.BitmexSymbol;
        side: BaseType.Side;
        size: number;
        text: string;
    }, logText?: string) {
        if (p.symbol !== 'XBTUSD') return false

        //TODO 直接成交

        return true
    }

    async close(p: {
        symbol: BaseType.BitmexSymbol;
        text: string;
    }, logText?: string) {
        if (p.symbol !== 'XBTUSD') return false

        //TODO 直接成交

        return true
    }

    async cancel(p: {
        orderID: string[];
        text: string;
    }, logText?: string) {

        this.jsonSync.rawData.symbol.XBTUSD.活动委托 = this.jsonSync.rawData.symbol.XBTUSD.活动委托.filter(v =>
            p.orderID.every(__id__ => v.id !== __id__)
        )

        return true
    }

    async runTask(task: PositionAndOrderTask) {
        this.realData.回测load(this.startTime, this.endTime)

        // this.ws.filledObservable.subscribe(v => task.onFilled(v))

        while (true) {
            this.realData.回测step()

            //TODO 成交
            //TODO task.onFilled

            await task.onTick(this)
        }
    }

} 