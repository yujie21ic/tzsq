import { BaseType } from '../lib/BaseType'
import { Account } from './Account'
import { BitMEXOrderAPI } from '../lib/BitMEX/BitMEXOrderAPI'

export const 委托检测step = (symbol: BaseType.BitmexSymbol) => async (self: Account) => {
    const { 仓位数量 } = self.jsonSync.rawData.symbol[symbol]

    const arr = self.jsonSync.rawData.symbol[symbol].活动委托.filter(v =>
        v.type === '限价' || v.type === '限价只减仓' || v.type === '市价触发'
    )

    const 限价只减仓 = self.jsonSync.rawData.symbol[symbol].活动委托.filter(v => v.type === '限价只减仓')

    //没有委托
    if (arr.length === 0) {
        return false
    }
    else if (arr.length === 1) {
        //没有仓位随便
        //有仓位 只能有减仓委托
        if (仓位数量 !== 0 && 限价只减仓.length === 0) {
            await BitMEXOrderAPI.cancel(self.cookie, arr.map(v => v.id))
            return true
        } else {
            return false
        }
    }
    else {
        //多个委托  全部给取消
        await BitMEXOrderAPI.cancel(self.cookie, arr.map(v => v.id))
        return true
    }
} 