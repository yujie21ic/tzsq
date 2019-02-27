import { RealData } from '../RealDataServer/RealData'
export const realData = new RealData(false)
import { BaseType } from '../lib/BaseType'
import { lastNumber } from '../lib/F/lastNumber'

//_________________________________________________________________________//

export const get信号msg = (symbol: BaseType.BitmexSymbol) => {
    const 上涨 = realData.dataExt[symbol].期货.信号_上涨
    const 下跌 = realData.dataExt[symbol].期货.信号_下跌
    const 追涨 = realData.dataExt[symbol].期货.信号_追涨
    const 追跌 = realData.dataExt[symbol].期货.信号_追跌

    return JSON.stringify({
        上涨: 上涨.length > 3 ? [上涨[上涨.length - 3], 上涨[上涨.length - 2], 上涨[上涨.length - 1]] : '',
        下跌: 下跌.length > 3 ? [下跌[下跌.length - 3], 下跌[下跌.length - 2], 下跌[下跌.length - 1]] : '',
        追涨: 追涨.length > 3 ? [追涨[追涨.length - 3], 追涨[追涨.length - 2], 追涨[追涨.length - 1]] : '',
        追跌: 追跌.length > 3 ? [追跌[追跌.length - 3], 追跌[追跌.length - 2], 追跌[追跌.length - 1]] : '',
        波动率: lastNumber(realData.dataExt[symbol].期货.波动率),
    })
}


export const 摸顶抄底信号灯side = (symbol: BaseType.BitmexSymbol) => {
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

const is连续几根全亮 = (几根: number, arr: ArrayLike<{ value: boolean }[]>) => {
    let 连续几根 = 0
    for (let i = arr.length - 1; i >= 0; i--) {
        if (arr[i].every(v => v.value)) {
            连续几根++
            if (连续几根 === 几根) return true
        } else {
            return false
        }
    }
    return false
}



export const get信号灯Type = (symbol: BaseType.BitmexSymbol) => {

    if (is连续几根全亮(3, realData.dataExt[symbol].期货.信号_上涨)) {
        return '摸顶'
    }
    else if (is连续几根全亮(3, realData.dataExt[symbol].期货.信号_下跌)) {
        return '抄底'
    }
    else if (is连续几根全亮(5, realData.dataExt[symbol].期货.信号_追涨)) {
        return '追涨'
    }
    else if (is连续几根全亮(5, realData.dataExt[symbol].期货.信号_追跌)) {
        return '追跌'
    } else {
        return 'none'
    }
}


export const get信号XXXmsg = (symbol: BaseType.BitmexSymbol) => {
    const 上涨做空下跌平仓 = realData.dataExt[symbol].期货.信号_上涨做空下跌平仓
    const 下跌抄底上涨平仓 = realData.dataExt[symbol].期货.信号_下跌抄底上涨平仓 

    return JSON.stringify({
        上涨做空下跌平仓: 上涨做空下跌平仓.length > 3 ? [上涨做空下跌平仓[上涨做空下跌平仓.length - 3], 上涨做空下跌平仓[上涨做空下跌平仓.length - 2], 上涨做空下跌平仓[上涨做空下跌平仓.length - 1]] : '',
        下跌抄底上涨平仓: 下跌抄底上涨平仓.length > 3 ? [下跌抄底上涨平仓[下跌抄底上涨平仓.length - 3], 下跌抄底上涨平仓[下跌抄底上涨平仓.length - 2], 下跌抄底上涨平仓[下跌抄底上涨平仓.length - 1]] : '', 
    })
}


export const is上涨做空下跌平仓 = (symbol: BaseType.BitmexSymbol) =>
    is连续几根全亮(2, realData.dataExt[symbol].期货.信号_上涨做空下跌平仓)

export const is下跌抄底上涨平仓 = (symbol: BaseType.BitmexSymbol) =>
    is连续几根全亮(2, realData.dataExt[symbol].期货.信号_下跌抄底上涨平仓)


export const get波动率 = (symbol: BaseType.BitmexSymbol) =>
    lastNumber(realData.dataExt[symbol].期货.波动率)