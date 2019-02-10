import { BaseType } from '../../lib/BaseType'
import { Account } from '../Account'
import { 信号灯side, realData } from '../realData'
import { BitMEXOrderAPI } from '../../lib/BitMEX/BitMEXOrderAPI'

const 交易数量 = 1

const 自动开仓step = (symbol: BaseType.BitmexSymbol) => async (self: Account) => {

    if (self.jsonSync.rawData.symbol[symbol].任务开关.自动开仓.value === false) {
        return true
    }

    const { 仓位数量 } = self.jsonSync.rawData.symbol[symbol]

    const 活动委托 = self.jsonSync.rawData.symbol[symbol].活动委托.filter(v =>
        v.type === '限价' || v.type === '限价只减仓' || v.type === '市价触发'
    )

    const 信号side = 信号灯side(symbol)


    //没有仓位 没有委托 信号灯全亮 挂单
    if (仓位数量 === 0 && 活动委托.length === 0 && 信号side !== 'none') {
        await BitMEXOrderAPI.maker(self.cookie, {
            symbol,
            side: 信号side,
            size: 交易数量,
            price: () => realData.getOrderPrice({
                symbol,
                side: 信号side,
                type: 'maker',
                位置: 0,
            }),
            reduceOnly: false,
        })
        return true
    }

    //有开仓单(限价) 15秒 取消
    if (活动委托.length === 1) {
        const { type, timestamp, id, side } = 活动委托[0]
        if (type === '限价') {
            if (
                Date.now() > (timestamp + 15 * 1000) ||         //超时 取消开仓单
                (信号side !== 'none' && 信号side !== side)       //出现反向信号 取消开仓单
            ) {
                await BitMEXOrderAPI.cancel(self.cookie, [id])
                return true
            }
        }
    }

    return false
}



export const XBTUSD自动开仓step = 自动开仓step('XBTUSD')