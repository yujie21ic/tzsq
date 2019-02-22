import { BaseType } from '../../lib/BaseType'
import { TradeAccount } from '../TradeAccount'
import { 信号灯side, realData, get波动率 } from '../realData'
import { toBuySellPriceFunc } from '../../lib/C/toBuySellPriceFunc'
import { sleep } from '../../lib/C/sleep'

const 交易数量 = 2

const 自动开仓step = (symbol: BaseType.BitmexSymbol) => async (self: TradeAccount) => {

    if (self.jsonSync.rawData.symbol[symbol].任务开关.自动开仓.value === false) {
        return true
    }

    const path = self.accountName + '.txt'

    const { 仓位数量 } = self.jsonSync.rawData.symbol[symbol]

    const 本地维护仓位数量 = symbol === 'XBTUSD' ? self.ws.本地维护XBTUSD仓位数量 : self.ws.本地维护ETHUSD仓位数量

    const 连续止损次数 = symbol === 'XBTUSD' ? self.ws.连续止损XBTUSD : self.ws.连续止损ETHUSD

    const 活动委托 = self.活动委托[symbol].filter(v => v.type !== '止损')

    const { 信号side, 信号msg } = 信号灯side(symbol)

    if (连续止损次数 >= 4) {
        await sleep(1000 * 60 * 10)//10min
        if (symbol === 'XBTUSD') self.ws.连续止损XBTUSD = 0
        if (symbol === 'ETHUSD') self.ws.连续止损ETHUSD = 0
    }

    //没有仓位 没有委托 信号灯全亮 挂单
    if (本地维护仓位数量 === 0 && 仓位数量 === 0 && 活动委托.length === 0 && 信号side !== 'none') {
        return get波动率(symbol) < 30 ?
            await self.order自动.taker({
                symbol,
                side: 信号side,
                size: 交易数量 * (连续止损次数 + 1),
            }, { path, text: '自动开仓step 自动开仓 市价' + 信号msg }, self.ws) :
            await self.order自动.limit({
                symbol,
                side: 信号side,
                size: 交易数量 * (连续止损次数 + 1),
                price: toBuySellPriceFunc(信号side, () => realData.getOrderPrice({
                    symbol,
                    side: 信号side,
                    type: 'taker',// 'maker',
                    位置: 0,
                })),
                // reduceOnly: false,
            }, { path, text: '自动开仓step 自动开仓 挂单' + 信号msg }, self.ws)
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