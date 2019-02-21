import { BaseType } from '../../lib/BaseType'
import { TradeAccount } from '../TradeAccount'
import { 信号灯side, realData } from '../realData'
import { toBuySellPriceFunc } from '../../lib/C/toBuySellPriceFunc'

const 交易数量 = 2

const 自动开仓step = (symbol: BaseType.BitmexSymbol) => async (self: TradeAccount) => {

    if (self.jsonSync.rawData.symbol[symbol].任务开关.自动开仓.value === false) {
        return true
    }

    const path = self.accountName + '.txt'

    const { 仓位数量 } = self.jsonSync.rawData.symbol[symbol]

    const 活动委托 = self.活动委托[symbol].filter(v => v.type !== '止损')

    const { 信号side, 信号msg } = 信号灯side(symbol)

    //没有仓位 没有委托 信号灯全亮 挂单
    if (仓位数量 === 0 && 活动委托.length === 0 && 信号side !== 'none') {
        return await self.order自动.limit({
            symbol,
            side: 信号side,
            size: 交易数量,
            price: toBuySellPriceFunc(信号side, () => realData.getOrderPrice({
                symbol,
                side: 信号side,
                type: 'taker',// 'maker',
                位置: 0,
            })),
            // reduceOnly: false,
        }, { path, text: '自动开仓step 自动开仓' + 信号msg })
    }

    //有开仓单(限价)  
    if (活动委托.length === 1) {
        const { type, timestamp, id, side } = 活动委托[0]
        if (type === '限价') {
            const _15秒取消 = (Date.now() > (timestamp + 15 * 1000))
            const 出现反向信号时候取消 = (信号side !== 'none' && 信号side !== side)
            if (_15秒取消 || 出现反向信号时候取消) {
                return await self.order自动.cancel([id], { path, text: '自动开仓step 取消开仓 ' + _15秒取消 ? '_15秒取消' : ('出现反向信号时候取消' + 信号msg) })
            }
        }
    }


    return false
}



export const XBTUSD自动开仓step = 自动开仓step('XBTUSD') 