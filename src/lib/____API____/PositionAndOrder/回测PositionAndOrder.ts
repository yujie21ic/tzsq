import { PositionAndOrder, PositionAndOrderTask } from './PositionAndOrder'
import { DataClient } from '../../../RealDataServer/DataClient'
import { createJSONSync } from './BitmexPositionAndOrder'
import { BaseType } from '../../BaseType'
import { lastNumber } from '../../F/lastNumber'
import { setWindowTitle } from '../../C/setWindowTitle'
import { 指标 } from '../../../指标/指标'
import * as fs from 'fs'

export class 回测PositionAndOrder implements PositionAndOrder {

    realData: DataClient.RealData__History

    jsonSync = createJSONSync() //不支持 subject.subscribe

    get本地维护仓位数量(symbol: BaseType.BitmexSymbol): number {
        return this.jsonSync.rawData.symbol[symbol].仓位数量
    }


    hopex_taker = (p: { size: number, side: BaseType.Side }) => {
        let ret = false
        //hopex 成交
        return ret
    }

    hopex_stop = (p: { side: BaseType.Side, stopPrice: number }) => {
        this.jsonSync.rawData.symbol.Hopex_BTC.活动委托.push({
            type: '止损',
            timestamp: lastNumber(this.realData.dataExt.XBTUSD.bitmex.时间),
            id: String(this.order_id++),
            side: p.side,
            cumQty: 0,
            orderQty: 100000,
            price: p.stopPrice,
        })
        return true
    }

    hopex_cancel = (p: { orderID: number }) => {
        this.jsonSync.rawData.symbol.Hopex_BTC.活动委托 = this.jsonSync.rawData.symbol.Hopex_BTC.活动委托.filter(v =>
            v.id !== String(p.orderID)
        )
        return true
    }

    private startTime: number
    private endTime: number
    constructor(startTime: number, endTime: number) {
        this.startTime = startTime
        this.endTime = endTime
        this.realData = new DataClient.RealData__History()
    }


    private 成交arr: BaseType.成交记录 = []


    private order_id = 1234

    maker(p: {
        symbol: BaseType.BitmexSymbol;
        side: BaseType.Side;
        size: number;
        price: () => number;
        reduceOnly: boolean;
        text: string;
    }, logText?: string) {
        if (p.symbol !== 'XBTUSD') return false

        const timestamp = lastNumber(this.realData.dataExt[p.symbol].bitmex.时间)

        console.log(`${new Date(timestamp).toLocaleString()}      ${p.text}`)

        this.成交arr.push({
            timestamp,
            type: p.side === 'Buy' ? '挂单买' : '挂单卖',
            size: p.size,
            price: p.price(),
            仓位数量: this.jsonSync.rawData.symbol.XBTUSD.仓位数量,
            开仓均价: this.jsonSync.rawData.symbol.XBTUSD.开仓均价,
            text: p.text,
        })

        this.jsonSync.rawData.symbol.XBTUSD.活动委托.push({
            type: p.reduceOnly ? '限价只减仓' : '限价',
            timestamp: lastNumber(this.realData.dataExt[p.symbol].bitmex.时间),
            id: String(this.order_id++),
            side: p.side,
            cumQty: 0,
            orderQty: p.size,
            price: p.price(),
        })

        return true
    }

    stop(p: {
        symbol: BaseType.BitmexSymbol;
        side: BaseType.Side;
        price: number;
        text: string;
    }, logText?: string) {
        if (p.symbol !== 'XBTUSD') return false

        this.jsonSync.rawData.symbol.XBTUSD.活动委托.push({
            type: '止损',
            timestamp: lastNumber(this.realData.dataExt[p.symbol].bitmex.时间),
            id: String(this.order_id++),
            side: p.side,
            cumQty: 0,
            orderQty: 100000,
            price: p.price,
        })

        return true
    }

    updateStop(p: {
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

    updateMaker(p: {
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

    limit(p: {
        symbol: BaseType.BitmexSymbol;
        side: BaseType.Side;
        size: number;
        price: () => number;
        text: string;
    }, logText?: string) {
        return this.成交({
            timestamp: lastNumber(this.realData.dataExt[p.symbol].bitmex.时间),
            symbol: p.symbol,
            side: p.side,
            size: p.size,
            price: p.price(),
            text: p.text,
            被动: false,
        })
    }

    taker(p: {
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

    close(p: {
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

    cancel(p: {
        orderID: string[];
        text: string;
    }, logText?: string) {

        this.jsonSync.rawData.symbol.XBTUSD.活动委托 = this.jsonSync.rawData.symbol.XBTUSD.活动委托.filter(v =>
            p.orderID.every(__id__ => v.id !== __id__)
        )

        return true
    }


    hopex_单位taker = 0
    hopex_单位盈利 = 0

    单位taker = 0
    单位maker = 0
    单位盈利 = 0

    成交(p: {
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
        }

        console.log(`${new Date(p.timestamp).toLocaleString()}      ${p.text}   开仓 =  ${this.jsonSync.rawData.symbol.XBTUSD.开仓均价}  平仓 =   ${p.price}   仓位数量 = ${this.jsonSync.rawData.symbol.XBTUSD.仓位数量}     单位taker = ${this.单位taker}       单位maker = ${this.单位maker}       单位盈利 = ${this.单位盈利}`)


        this.成交arr.push({
            timestamp: p.timestamp,
            type: p.被动 ? (p.side === 'Buy' ? '挂单买成功' : '挂单卖成功') : (p.side === 'Buy' ? '市价买' : '市价卖'),
            size: p.size,
            price: p.price,
            仓位数量: this.jsonSync.rawData.symbol.XBTUSD.仓位数量,
            开仓均价: this.jsonSync.rawData.symbol.XBTUSD.开仓均价,
            text: p.text,
        })


        if (this.jsonSync.rawData.symbol.XBTUSD.仓位数量 === 0) {
            console.log('____________________________________________________________________________________________________________________________________________________________________________________')
        }

        return true
    }



    async runTask(task: PositionAndOrderTask) {
        console.log('_________________________回测开始_________________________')

        await this.realData.回测load(this.startTime, this.endTime)

        while (true) {
            if (this.realData.回测step() === false) {
                fs.writeFileSync('./db/成交记录.json', JSON.stringify(this.成交arr, undefined, 4))
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

                        //只减仓
                        let size = v.orderQty
                        if (v.type === '限价只减仓') {
                            const count = this.get本地维护仓位数量('XBTUSD')
                            if (count === 0) {
                                return false
                            }
                            else if (v.side === 'Buy' && count > 0) {
                                return false
                            }
                            if (v.side === 'Sell' && count < 0) {
                                return false
                            } else {
                                size = Math.min(Math.abs(count), v.orderQty)
                            }
                        }

                        this.成交({
                            timestamp: lastNumber(this.realData.dataExt.XBTUSD.bitmex.时间),
                            symbol: 'XBTUSD',
                            side: v.side,
                            size,
                            price: v.price,
                            text: v.type === '限价' ? '开仓' : '平仓',
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
                            timestamp: lastNumber(this.realData.dataExt.XBTUSD.bitmex.时间),
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

            setWindowTitle(new Date(lastNumber(this.realData.dataExt.XBTUSD.bitmex.时间)).toLocaleString())

            指标.回测setTime()
            task.onTick(this)
        }
    }

} 