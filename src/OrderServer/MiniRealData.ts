import { BaseType } from '../lib/BaseType'
import { mapObjIndexed } from '../lib/F/mapObjIndexed'


export class MiniRealData {

    //1秒1个
    private dic = mapObjIndexed(() => [] as BaseType.OrderBook[], BaseType.BitmexSymbolDic)

    constructor() {

    }


    in = (p: {
        symbol: BaseType.BitmexSymbol
        timestamp: number
        buy: {
            price: number;
            size: number;
        }[]
        sell: {
            price: number;
            size: number;
        }[]
    }) => {
        //TODO
    }


    getOrderPrice = ({ symbol, side, type, 位置 }: { symbol: BaseType.BitmexSymbol, side: BaseType.Side, type: 'taker' | 'maker', 位置: number }) => {
        const pk = this.dic[symbol]

        if (pk.length < 1) return NaN
        const p = pk[pk.length - 1]

        if (side === 'Buy') {
            if (type === 'taker') {
                return p.sell[位置] ? p.sell[位置].price : NaN
            } else {
                return p.buy[位置] ? p.buy[位置].price : NaN
            }
        } else if (side === 'Sell') {
            if (type === 'taker') {
                return p.buy[位置] ? p.buy[位置].price : NaN
            } else {
                return p.sell[位置] ? p.sell[位置].price : NaN
            }
        } else {
            return NaN
        }
    }


    get期货多少秒内最高最低(symbol: BaseType.BitmexSymbol, second: number) {
        const data = this.dic[symbol]

        let high = NaN
        let low = NaN

        if (data.length >= second) {
            for (let i = data.length - 1; i >= data.length - second; i--) {
                if (isNaN(high)) {
                    high = data[i].sell[0].price
                } else {
                    high = Math.max(high, data[i].sell[0].price)
                }

                if (isNaN(low)) {
                    low = data[i].buy[0].price
                } else {
                    low = Math.max(low, data[i].buy[0].price)
                }
            }
        }
        return { high, low }
    }

    getBuy1Price(symbol: BaseType.BitmexSymbol) {
        const pk = this.dic[symbol]

        if (pk.length < 1) return NaN

        const p = pk[pk.length - 1]

        return p.buy[0].price
    }

    getSell1Price(symbol: BaseType.BitmexSymbol) {
        const pk = this.dic[symbol]

        if (pk.length < 1) return NaN

        const p = pk[pk.length - 1]

        return p.sell[0].price
    }

}