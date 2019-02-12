import { RealData } from '../RealDataServer/RealData'
export const realData = new RealData(false)
import { BaseType } from '../lib/BaseType'
import { lastNumber } from '../lib/F/lastNumber'
import { to价格对齐 } from '../lib/F/to价格对齐'

//_________________________________________________________________________//

const get信号msg = (symbol: BaseType.BitmexSymbol) => {
    const up = realData.dataExt[symbol].期货.信号_上涨
    const down = realData.dataExt[symbol].期货.信号_下跌
    const 上涨下跌 = realData.dataExt[symbol].期货.上涨还是下跌

    return JSON.stringify({
        信号_上涨: up.length > 0 ? up[up.length - 1] : '',
        信号_下跌: down.length > 0 ? down[down.length - 1] : '',
        波动率: lastNumber(realData.dataExt[symbol].期货.波动率),
        上涨下跌: 上涨下跌.length > 0 ? 上涨下跌[上涨下跌.length - 1] : '',
    }, undefined, 4)
}


export const 信号灯side = (symbol: BaseType.BitmexSymbol) => {
    const up = realData.dataExt[symbol].期货.信号_上涨
    const down = realData.dataExt[symbol].期货.信号_下跌
    const 上涨下跌 = realData.dataExt[symbol].期货.上涨还是下跌

    if (上涨下跌.length > 0 && 上涨下跌[上涨下跌.length - 1] === '上涨' && up.length > 0 && up[up.length - 1].every(v => v.value)) {
        return { 信号side: 'Sell' as 'Sell', 信号msg: get信号msg(symbol) }
    }
    else if (上涨下跌.length > 0 && 上涨下跌[上涨下跌.length - 1] === '下跌' && down.length > 0 && down[down.length - 1].every(v => v.value)) {
        return { 信号side: 'Buy' as 'Buy', 信号msg: get信号msg(symbol) }
    }
    else {
        return { 信号side: 'none' as 'none', 信号msg: '' }
    }
}

export const get波动率 = (symbol: BaseType.BitmexSymbol) =>
    lastNumber(realData.dataExt[symbol].期货.波动率)

export const toGridPoint = (symbol: BaseType.BitmexSymbol, value: number, side: BaseType.Side) => {
    const grid = symbol === 'XBTUSD' ? 0.5 : 0.05
    return to价格对齐({ grid, side, value })
}