import { BaseType } from '../BaseType'
import { BitMEXMessage } from './BitMEXMessage'

export class BitMEXWSAPI__增量同步数据 {

    //private
    orderMap = new Map<string, BitMEXMessage.Order>()

    private dic = new Map<BaseType.BitmexSymbol, {
        仓位数量: number
        连续止损: number
    }>()

    log = (text: string) => { }


    private xxx = (key: '仓位数量' | '连续止损') => ({
        partial: (symbol: BaseType.BitmexSymbol, n: number) => {
            const obj = this.dic.get(symbol)
            if (obj !== undefined) {
                obj[key] = n
            }
            else {
                const obj = { 仓位数量: 0, 连续止损: 0 }
                obj[key] = n
                this.dic.set(symbol, obj)
            }
            this.log(`增量同步数据 ${symbol} ${key} partial ${n}`)
        },
        update: (symbol: BaseType.BitmexSymbol, n: number) => {
            const obj = this.dic.get(symbol)
            if (obj !== undefined) {
                obj[key] += n
            }
            else {
                const obj = { 仓位数量: 0, 连续止损: 0 }
                obj[key] = n
                this.dic.set(symbol, obj)
            }
            this.log(`增量同步数据 ${symbol}  ${key} update to ${this.dic.get(symbol)![key]}`)
        },
        get: (symbol: BaseType.BitmexSymbol) => {
            const obj = this.dic.get(symbol)
            if (obj !== undefined) {
                return obj[key]
            }
            else {
                return 0
            }
        },
    })

    仓位数量 = this.xxx('仓位数量')
    连续止损 = this.xxx('连续止损')

    //可变数据  直接修改 
    private 新成交(v: { symbol: string, side: string, 已经成交?: number, cumQty: number }) {
        if (v.已经成交 === undefined) {
            v.已经成交 = 0
        }

        const 新成交 = v.cumQty - v.已经成交

        if (新成交 > 0) {
            v.已经成交 = v.cumQty
            this.仓位数量.update(v.symbol as BaseType.BitmexSymbol, 新成交 * (v.side === 'Buy' ? 1 : -1))
        }
    }

    onOrder(order: BitMEXMessage.Order) {
        this.新成交(order)

        //止盈
        if (order.ordType === 'Limit' && order.execInst === 'ParticipateDoNotInitiate,ReduceOnly' && order.ordStatus === 'Filled') {
            this.连续止损.partial(order.symbol as BaseType.BitmexSymbol, 0)
        }

        //止损
        if (order.ordType === 'Stop' && order.execInst === 'Close,LastPrice' && order.ordStatus === 'Filled') {
            this.连续止损.update(order.symbol as BaseType.BitmexSymbol, 1)
        }
    }

    onExecution(execution: BitMEXMessage.Execution) {
        if (execution.ordType === 'StopLimit') {
            this.新成交(execution)
        }
    }
}