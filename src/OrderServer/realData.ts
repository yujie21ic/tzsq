import { RealData } from '../RealDataServer/RealData'
export const realData = new RealData(false)
import { BaseType } from '../lib/BaseType'
import { lastNumber } from '../lib/F/lastNumber'
import { is连续几根全亮 } from '../lib/C/is连续几根全亮'

//_________________________________________________________________________//

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