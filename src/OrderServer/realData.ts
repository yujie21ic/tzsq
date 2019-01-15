import { RealData } from '../RealDataServer/RealData'
export const realData = new RealData(false)




import { BaseType } from '../lib/BaseType'
import { BitMEXOrderAPI } from '../lib/BitMEX/BitMEXOrderAPI'

export const 下单 = async (
    cookie: string,
    p: {
        symbol: BaseType.BitmexSymbol
        side: BaseType.Side
        size: number
        type: 'taker' | 'maker'
    }
) => {

    const getPrice = () => realData.getOrderPrice(p.symbol, p.side, p.type)

    if (isNaN(getPrice())) {
        throw '服务器还没有 买1 卖1 价格'
    }

    return p.type === 'taker' ?
        await BitMEXOrderAPI.taker(cookie, p) :
        await BitMEXOrderAPI.maker(cookie, {
            symbol: p.symbol,
            side: p.side,
            size: p.size,
            price: getPrice,
        })
}
