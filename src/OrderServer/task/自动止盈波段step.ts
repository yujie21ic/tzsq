import { BaseType } from '../../lib/BaseType'
import { TradeAccount } from '../TradeAccount'
import { get波动率, realData, 摸顶抄底信号灯side, is上涨做空下跌平仓, is下跌抄底上涨平仓, get信号XXXmsg } from '../realData'
import { toGridPoint } from '../../lib/F/toGridPoint'
import { toBuySellPriceFunc } from '../../lib/C/toBuySellPriceFunc'

const 自动止盈波段step = (symbol: BaseType.BitmexSymbol) => {
    let 止盈价格 = NaN
    let 最大仓位abs = 0
    let 最后一次开仓时间 = NaN

    return async (self: TradeAccount) => {

        if (self.jsonSync.rawData.symbol[symbol].任务开关.自动止盈波段.value === false) {
            return true
        }

        const { 仓位数量, 开仓均价 } = self.jsonSync.rawData.symbol[symbol]
        const 活动委托 = self.活动委托[symbol].filter(v => v.type !== '止损')

        if (仓位数量 !== 0) {

            if (isNaN(最大仓位abs) || 最大仓位abs < Math.abs(仓位数量)) {
                最大仓位abs = Math.abs(仓位数量)
                最后一次开仓时间 = Date.now()
            }

            if (活动委托.length === 0) {

                const side = 仓位数量 > 0 ? 'Sell' : 'Buy'

                const getPrice = () => {
                    const 止盈点 = get波动率(symbol) / 3 + 3
                    const 止盈点价格 = toGridPoint(symbol, 仓位数量 > 0 ? 开仓均价 + 止盈点 : 开仓均价 - 止盈点, side)

                    const 位置1价格 = realData.getOrderPrice({
                        symbol,
                        side,
                        type: 'maker',
                        位置: 0,
                    })
                    return side === 'Buy' ?
                        Math.min(止盈点价格, 位置1价格) :
                        Math.max(止盈点价格, 位置1价格)
                }

                if (isNaN(止盈价格)) {
                    止盈价格 = getPrice()
                }




                const get位置1价格 = () => realData.getOrderPrice({
                    symbol,
                    side,
                    type: 'maker',
                    位置: 0,
                })


                //下单30s后，折返没有超过下单点的折返函数，挂单全平


                //追涨追跌如果5分钟还没有涨超过10点，挂单全平
                const 最后一次开仓type = self.ws.增量同步数据.最后一次自动开仓.get(symbol)
                if ((最后一次开仓type === '追涨' || 最后一次开仓type === '追跌') && Date.now() - 最后一次开仓时间 >= 5 * 60 * 1000) {
                    return await self.order自动.maker({
                        symbol,
                        side,
                        size: 最大仓位abs,
                        price: toBuySellPriceFunc(side, get位置1价格),
                        reduceOnly: true,
                        text: '自动止盈波段step 追涨追跌如果5分钟还没有涨超过10点，挂单全平',
                    })
                }


                //
                if (self.ws.增量同步数据.最后一次自动开仓.get(symbol) === '摸顶' && is上涨做空下跌平仓(symbol)) {
                    return await self.order自动.maker({
                        symbol,
                        side,
                        size: Math.round(最大仓位abs / 2),//一半
                        price: toBuySellPriceFunc(side, get位置1价格),
                        reduceOnly: true,
                        text: '自动止盈波段step 上涨做空下跌平仓',
                    }, get信号XXXmsg(symbol))
                }


                if (self.ws.增量同步数据.最后一次自动开仓.get(symbol) === '抄底' && is下跌抄底上涨平仓(symbol)) {
                    return await self.order自动.maker({
                        symbol,
                        side,
                        size: Math.round(最大仓位abs / 2),//一半
                        price: toBuySellPriceFunc(side, get位置1价格),
                        reduceOnly: true,
                        text: '自动止盈波段step 下跌抄底上涨平仓',
                    }, get信号XXXmsg(symbol))
                }



                //触发了反向开仓信号 
                const { 信号side, 信号msg } = 摸顶抄底信号灯side(symbol)

                if (信号side === side) {

                    return await self.order自动.maker({
                        symbol,
                        side,
                        size: Math.round(最大仓位abs / 2),//一半
                        price: toBuySellPriceFunc(side, get位置1价格),
                        reduceOnly: true,
                        text: '自动止盈波段step 平一半',
                    }, 信号side + ' 信号msg:' + 信号msg)

                    // if (
                    //     (side === 'Buy' && get位置1价格() <= 止盈价格) ||
                    //     (side === 'Sell' && get位置1价格() >= 止盈价格)

                    // ) {

                    // } else {
                    //     return false
                    // }
                }
            }
        } else {
            止盈价格 = NaN
            最大仓位abs = NaN
            最后一次开仓时间 = NaN
        }

        return false
    }
}


export const XBTUSD自动止盈波段step = 自动止盈波段step('XBTUSD')