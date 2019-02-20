import { RealData } from '../RealDataServer/RealData'
export const realData = new RealData(false)
import { BaseType } from '../lib/BaseType'
import { lastNumber } from '../lib/F/lastNumber'

//_________________________________________________________________________//

const get信号msg = (symbol: BaseType.BitmexSymbol) => {
    const up = realData.dataExt[symbol].期货.信号_上涨
    const down = realData.dataExt[symbol].期货.信号_下跌

    return JSON.stringify({
        信号_上涨: up.length > 3 ? [up[up.length - 3], up[up.length - 2], up[up.length - 1]] : '',
        信号_下跌: down.length > 3 ? [down[down.length - 3], down[down.length - 2], down[down.length - 1]] : '',
        波动率: lastNumber(realData.dataExt[symbol].期货.波动率),
    }, undefined, 4)
}


export const 信号灯side = (symbol: BaseType.BitmexSymbol) => {
    const up = realData.dataExt[symbol].期货.信号_上涨
    const down = realData.dataExt[symbol].期货.信号_下跌

    if (up.length > 3 && up[up.length - 1].every(v => v.value) && up[up.length - 2].every(v => v.value) && up[up.length - 3].every(v => v.value)) {
        return { 信号side: 'Sell' as 'Sell', 信号msg: get信号msg(symbol) }
    }
    else if (down.length > 3 && down[down.length - 1].every(v => v.value) && down[down.length - 2].every(v => v.value) && down[down.length - 3].every(v => v.value)) {
        return { 信号side: 'Buy' as 'Buy', 信号msg: get信号msg(symbol) }
    }
    else {
        return { 信号side: 'none' as 'none', 信号msg: '' }
    }
}

export const get波动率 = (symbol: BaseType.BitmexSymbol) =>
    lastNumber(realData.dataExt[symbol].期货.波动率)