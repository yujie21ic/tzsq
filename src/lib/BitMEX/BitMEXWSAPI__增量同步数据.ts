import { BaseType } from '../BaseType'
import { BitMEXMessage } from './BitMEXMessage'

export class BitMEXWSAPI__增量同步数据 {

    private orderMap = new Map<string, BitMEXMessage.Order>()

    private dic = new Map<BaseType.BitmexSymbol, {
        仓位数量: number
        连续止损: number
    }>()


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

}