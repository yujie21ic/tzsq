import { PositionAndOrder, PositionAndOrderTask } from './PositionAndOrder'
import { DataClient } from '../../RealDataServer/DataClient'
import { createJSONSync } from './BitmexPositionAndOrder'
import { BaseType } from '../../lib/BaseType'
import { lastNumber } from '../../lib/F/lastNumber'

export class 回测PositionAndOrder implements PositionAndOrder {

    realData: DataClient.RealData__History

    jsonSync = createJSONSync() //不支持 subject.subscribe

    get本地维护仓位数量(symbol: BaseType.BitmexSymbol): number {
        return this.jsonSync.rawData.symbol[symbol].仓位数量
    }

    //重复
    get浮盈点数(symbol: BaseType.BitmexSymbol) {
        const 最新价 = lastNumber(this.realData.dataExt[symbol].期货.最新价)
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
        this.jsonSync.rawData.symbol.XBTUSD.任务开关.自动开仓追涨 = false
        this.jsonSync.rawData.symbol.XBTUSD.任务开关.自动开仓追跌 = false
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
            timestamp: lastNumber(this.realData.dataExt[p.symbol].期货.时间),
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
            timestamp: lastNumber(this.realData.dataExt[p.symbol].期货.时间),
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
        return this.成交({
            timestamp: lastNumber(this.realData.dataExt[p.symbol].期货.时间),
            symbol: p.symbol,
            side: p.side,
            size: p.size,
            price: p.price(),
            text: p.text,
            被动: false,
        })
    }

    async taker(p: {
        symbol: BaseType.BitmexSymbol;
        side: BaseType.Side;
        size: number;
        text: string;
    }, logText?: string) {
        return this.limit({
            symbol: p.symbol,
            side: p.side,
            size: p.size,
            price: () => this.realData.getOrderPrice({
                symbol: p.symbol,
                side: p.side,
                type: 'taker',
                位置: 0,
            }),
            text: p.text,
        }, logText)
    }

    async close(p: {
        symbol: BaseType.BitmexSymbol;
        text: string;
    }, logText?: string) {
        const countAbs = this.get本地维护仓位数量(p.symbol)
        return this.taker({
            symbol: p.symbol,
            side: countAbs > 0 ? 'Sell' : 'Buy',
            size: Math.abs(countAbs),
            text: p.text
        }, logText)
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


    单位taker = 0
    单位maker = 0
    单位盈利 = 0

    async 成交(p: {
        timestamp: number
        symbol: BaseType.BitmexSymbol
        side: BaseType.Side
        size: number
        price: number
        text: string
        被动: boolean
    }) {
        if (p.symbol !== 'XBTUSD') return false

        const count = p.side === 'Buy' ? p.size : -p.size
        let is减仓 = false
        if (this.jsonSync.rawData.symbol.XBTUSD.仓位数量 > 0 && count < 0) {
            is减仓 = true
        }
        else if (this.jsonSync.rawData.symbol.XBTUSD.仓位数量 < 0 && count > 0) {
            is减仓 = true
        }

        //手续费
        if (p.被动) {
            this.单位maker += p.size
        } else {
            this.单位taker += p.size * 3 //是被动的3倍
        }

        //盈利 亏损
        if (is减仓) {
            const 开仓价 = this.jsonSync.rawData.symbol.XBTUSD.开仓均价
            const 平仓价 = p.price
            this.单位盈利 += (p.side === 'Sell' ? 平仓价 - 开仓价 : 开仓价 - 平仓价) * p.size
        } else {
            //不会有加仓
            this.jsonSync.rawData.symbol.XBTUSD.开仓均价 = p.price
        }

        this.jsonSync.rawData.symbol.XBTUSD.仓位数量 += count
        if (this.jsonSync.rawData.symbol.XBTUSD.仓位数量 === 0) {
            this.jsonSync.rawData.symbol.XBTUSD.开仓均价 = 0

            //删除 只减仓
            this.jsonSync.rawData.symbol.XBTUSD.活动委托 = this.jsonSync.rawData.symbol.XBTUSD.活动委托.filter(v => v.type !== '限价只减仓')
        }

        console.log(`${new Date(p.timestamp).toLocaleString()}      ${p.text}       仓位数量 = ${this.jsonSync.rawData.symbol.XBTUSD.仓位数量}     单位taker = ${this.单位taker}       单位maker = ${this.单位maker}       单位盈利 = ${this.单位盈利}`)

        return true
    }



    async runTask(task: PositionAndOrderTask) {
        console.log('_________________________回测开始_________________________')

        await this.realData.回测load(this.startTime, this.endTime)

        while (true) {
            if (this.realData.回测step() === false) {
                console.log('_________________________回测结束_________________________')
                return
            }

            const 买1 = this.realData.getOrderPrice({
                symbol: 'XBTUSD',
                side: 'Buy',
                type: 'maker',
                位置: 0,
            })
            const 卖1 = this.realData.getOrderPrice({
                symbol: 'XBTUSD',
                side: 'Sell',
                type: 'maker',
                位置: 0,
            })

            this.jsonSync.rawData.symbol.XBTUSD.活动委托 = this.jsonSync.rawData.symbol.XBTUSD.活动委托.filter(v => {
                if (v.type === '限价' || v.type === '限价只减仓') {
                    if ((v.side === 'Buy' && 买1 < v.price) ||
                        (v.side === 'Sell' && 卖1 > v.price)
                    ) {
                        this.成交({
                            timestamp: lastNumber(this.realData.dataExt.XBTUSD.期货.时间),
                            symbol: 'XBTUSD',
                            side: v.side,
                            size: v.orderQty,
                            price: v.price,
                            text: '平仓',
                            被动: true,
                        })
                        task.onFilled({ symbol: 'XBTUSD', type: v.type })
                        return false
                    }
                }
                else if (v.type === '止损') {
                    if ((v.side === 'Buy' && 卖1 >= v.price) ||
                        (v.side === 'Sell' && 买1 <= v.price)
                    ) {
                        this.成交({
                            timestamp: lastNumber(this.realData.dataExt.XBTUSD.期货.时间),
                            symbol: 'XBTUSD',
                            side: v.side,
                            size: Math.abs(this.jsonSync.rawData.symbol.XBTUSD.仓位数量),//________________
                            price: v.price,
                            text: v.type + '',
                            被动: false,
                        })
                        task.onFilled({ symbol: 'XBTUSD', type: v.type })
                        return false
                    }
                }
                return true
            })


            await task.onTick(this)
        }
    }

} 