import { BaseType } from '../../lib/BaseType'
import { Account } from '../Account'
import { get波动率, realData, 信号灯side } from '../realData'
import { toGridPoint } from '../../lib/F/toGridPoint'
import { toBuySellPriceFunc } from '../../lib/C/toBuySellPriceFunc';

const 自动止盈step = (symbol: BaseType.BitmexSymbol) => async (self: Account) => {

    if (self.jsonSync.rawData.symbol[symbol].任务开关.自动止盈.value === false) {
        return true
    }


    const path = self.accountName + '__' + symbol + '__自动止盈step.txt'

    const { 仓位数量, 开仓均价 } = self.jsonSync.rawData.symbol[symbol]
    const 活动委托 = self.jsonSync.rawData.symbol[symbol].活动委托.filter(v =>
        v.type === '限价' || v.type === '限价只减仓' || v.type === '市价触发'
    )

    //_____________________________________自动交易 止盈任务_____________________________________    
    if (仓位数量 !== 0) {
        //先把止盈挂上
        if (活动委托.length === 0) {
            const side = 仓位数量 > 0 ? 'Sell' : 'Buy'


            const getPrice = () => {
                const 止盈点 = get波动率(symbol) / 10 + 3
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

            if (isNaN(getPrice())) {
                return false
            }

            return await self.order自动.maker({
                symbol,
                side,
                size: Math.abs(仓位数量),
                price: toBuySellPriceFunc(side, getPrice),
                reduceOnly: true,
            }, { path, text: '挂单平仓' + side + '  price:' + getPrice() })
        }
        else if (活动委托.length === 1) {
            //触发了反向开仓信号 提前 修改 止盈
            if (活动委托[0].side === (仓位数量 > 0 ? 'Sell' : 'Buy') && 活动委托[0].type === '限价只减仓') {
                const { 信号side, 信号msg } = 信号灯side(symbol)
                if (信号side === 活动委托[0].side) {
                    return await self.order自动.updateMaker({
                        orderID: 活动委托[0].id,
                        price: toBuySellPriceFunc(信号side, () => realData.getOrderPrice({
                            symbol,
                            side: 信号side,
                            type: 'maker',
                            位置: 0,
                        }))
                    }, { path, text: '修改平仓' + 信号side + ' 信号msg:' + 信号msg })
                }
            }
        }
    }

    return false
}

export const XBTUSD自动止盈step = 自动止盈step('XBTUSD')