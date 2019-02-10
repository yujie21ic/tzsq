import { RealData } from '../RealDataServer/RealData'
export const realData = new RealData(false)
import { BaseType } from '../lib/BaseType'
import { lastNumber } from '../lib/F/lastNumber'
import { to价格对齐 } from '../lib/F/to价格对齐'

//_________________________________________________________________________//

export const 信号灯side = (symbol: BaseType.BitmexSymbol) => {

    //TODO
    // 10s最大值在价格的位置i大，10s最小值在价格位置中的i小，如果i大-i小>0,也就是最大值出现的比最小值晚，那么就是上涨，如果i大-i小<0,那么就是下跌


    const up = realData.dataExt[symbol].期货.信号_上涨
    const down = realData.dataExt[symbol].期货.信号_下跌

    if (up.length > 0 && up[up.length - 1].every(v => v.value)) {
        return 'Sell'
    }
    else if (down.length > 0 && down[down.length - 1].every(v => v.value)) {
        return 'Buy'
    }
    else {
        return 'none'
    }
}

export const get波动率 = (symbol: BaseType.BitmexSymbol) =>
    lastNumber(realData.dataExt[symbol].期货.波动率)

export const toGridPoint = (symbol: BaseType.BitmexSymbol, value: number, side: BaseType.Side) => {
    const grid = symbol === 'XBTUSD' ? 0.5 : 0.05
    return to价格对齐({ grid, side, value })
}