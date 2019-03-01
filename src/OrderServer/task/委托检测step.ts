import { BaseType } from '../../lib/BaseType'
import { TradeAccount } from '../../统一接口/TradeAccount'

export const 委托检测step = (symbol: BaseType.BitmexSymbol) => async (self: TradeAccount) => {

    const { 仓位数量 } = self.jsonSync.rawData.symbol[symbol]

    const 活动委托 = self.活动委托[symbol].filter(v => v.type !== '止损')

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
            //依赖ws先返回 委托更新 再返回仓位更新      //<---------------------------------------------
            (活动委托[0].type === '限价' && 活动委托[0].cumQty !== 0) ||

            //或者 限价只减仓委托
            活动委托[0].type === '限价只减仓'
        ) {
            return false
        } else {
            return await self.order自动.cancel({ orderID: 活动委托.map(v => v.id), text: '委托检测step 取消委托' }, 活动委托[0].type)
        }
    }
    else {
        //多个委托  全部给取消  
        return await self.order自动.cancel({ orderID: 活动委托.map(v => v.id), text: '委托检测step 取消多个委托' }, 活动委托.map(v => v.type).join(','))
    }
} 