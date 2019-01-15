import { BaseType } from '../lib/BaseType'
import { BitMEXOrderAPI } from '../lib/BitMEX/BitMEXOrderAPI'
import { realData } from './realData'
import { lastNumber } from '../lib/F/lastNumber'

export const 下单和止损 = async (
    cookie: string,
    p: {
        symbol: BaseType.BitmexSymbol
        side: BaseType.Side
        size: number
        type: 'taker' | 'maker'
        止损点: number
    }
) => {
    if (
        p.type === 'taker' ?
            await BitMEXOrderAPI.taker(cookie, p) :
            await BitMEXOrderAPI.maker(cookie, {
                symbol: p.symbol,
                side: p.side,
                size: p.size,
                price: () => realData.getOrderPrice(p.symbol, p.side, p.type)
            })
    ) {
        const nowPrice = () => realData.getOrderPrice(p.symbol, p.side, p.type)

        const side = p.side === 'Buy' ? 'Sell' : 'Buy'

        let 止损点 = p.止损点

        const item = realData.dataExt[p.symbol as 'XBTUSD']

        if (止损点 === 0 && item !== undefined) {
            止损点 = Math.max(lastNumber(item.期货.波动率) / 15, 3)
            const gridPoint = p.symbol === 'ETHUSD' ? 0.05 : 0.5
            止损点 = Math.floor(止损点 / gridPoint) * gridPoint
        }

        return await BitMEXOrderAPI.stop(cookie, {
            symbol: p.symbol,
            side,
            price: () => nowPrice() + 止损点 * (side === 'Buy' ? 1 : -1),
        })
    }
    return false
}