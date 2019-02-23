import { BaseType } from '../BaseType'
import { BitMEXMessage } from './BitMEXMessage'

export class BitMEXWSAPI__增量同步数据 {

    //private
    orderMap = new Map<string, BitMEXMessage.Order>()

    private dic = new Map<BaseType.BitmexSymbol, {
        仓位数量: number
        连续止损: number
    }>()


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
}