import { BaseType } from '../../lib/BaseType'
import { Account } from '../Account'
import { BitMEXOrderAPI } from '../../lib/BitMEX/BitMEXOrderAPI'

export const 委托检测step = (symbol: BaseType.BitmexSymbol) => async (self: Account) => {

    const { 仓位数量 } = self.jsonSync.rawData.symbol[symbol]

    const 活动委托 = self.jsonSync.rawData.symbol[symbol].活动委托.filter(v =>
        v.type === '限价' || v.type === '限价只减仓' || v.type === '市价触发'
    )

    //没有委托
    if (活动委托.length === 0) {
        return false
    }
    else if (活动委托.length === 1) {
        if (
            //没有仓位随便
            仓位数量 === 0 ||

            //有仓位 有委托 只能是 
            //部分成交的委托 
            //依赖ws先返回 委托更新 再返回仓位更新 (测试发现是这样子的)
            (活动委托[0].type === '限价' && 活动委托[0].cumQty !== 0) ||

            //或者 限价减仓委托
            活动委托[0].type === '限价只减仓'
        ) {
            return false
        } else {
            //ws返回有时间  直接给委托列表加一条记录??
            await BitMEXOrderAPI.cancel(self.cookie, 活动委托.map(v => v.id))
            return true
        }
    }
    else {
        //多个委托  全部给取消
        //ws返回有时间  直接给委托列表加一条记录??
        await BitMEXOrderAPI.cancel(self.cookie, 活动委托.map(v => v.id))
        return true
    }
} 