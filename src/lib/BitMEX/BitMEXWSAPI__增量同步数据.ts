import { BaseType } from '../BaseType'
import { BitMEXMessage } from './BitMEXMessage'

export class BitMEXWSAPI__增量同步数据 {

    private orderMap = new Map<string, BitMEXMessage.Order>()

    private dic = new Map<BaseType.BitmexSymbol, {
        仓位数量: number
        连续止损: number
    }>()


    //仓位数量
    partial_仓位数量(symbol: BaseType.BitmexSymbol, n: number) {
        const obj = this.dic.get(symbol)
        if (obj !== undefined) {
            obj.仓位数量 = n
        }
        else {
            this.dic.set(symbol, { 仓位数量: n, 连续止损: 0 })
        }
    }

    update_仓位数量(symbol: BaseType.BitmexSymbol, n: number) {
        const obj = this.dic.get(symbol)
        if (obj !== undefined) {
            obj.仓位数量 += n
        }
        else {
            this.dic.set(symbol, { 仓位数量: n, 连续止损: 0 })
        }
    }

    get_仓位数量(symbol: BaseType.BitmexSymbol) {
        const obj = this.dic.get(symbol)
        if (obj !== undefined) {
            return obj.仓位数量
        }
        else {
            return 0
        }
    }

    //连续止损
    partial_连续止损(symbol: BaseType.BitmexSymbol, n: number) {
        const obj = this.dic.get(symbol)
        if (obj !== undefined) {
            obj.连续止损 = n
        }
        else {
            this.dic.set(symbol, { 仓位数量: 0, 连续止损: n })
        }
    }

    update_连续止损(symbol: BaseType.BitmexSymbol, n: number) {
        const obj = this.dic.get(symbol)
        if (obj !== undefined) {
            obj.连续止损 += n
        }
        else {
            this.dic.set(symbol, { 仓位数量: 0, 连续止损: n })
        }
    }

    get_连续止损(symbol: BaseType.BitmexSymbol) {
        const obj = this.dic.get(symbol)
        if (obj !== undefined) {
            return obj.连续止损
        }
        else {
            return 0
        }
    }

}