import { BaseType } from '../../lib/BaseType'
import { Account } from '../Account'
import { BitMEXOrderAPI } from '../../lib/BitMEX/BitMEXOrderAPI'
import { to价格对齐 } from '../../lib/F/to价格对齐'

const toGridPoint = (symbol: BaseType.BitmexSymbol, value: number, side: BaseType.Side) => {
    const grid = symbol === 'XBTUSD' ? 0.5 : 0.05
    return to价格对齐({ grid, side, value })
}

export const 止损step = ({
    symbol,
    初始止损点,
    推止损,
}: {
    symbol: BaseType.BitmexSymbol
    初始止损点: () => number
    推止损: (盈利点: number) => number //0 成本价  3 盈利3点的价
}) => async (self: Account) => {
    const { 仓位数量, 开仓均价 } = self.jsonSync.rawData.symbol[symbol]
    const 止损委托 = self.jsonSync.rawData.symbol[symbol].活动委托.filter(v => v.type === '止损')

    //没有止损 
    if (止损委托.length === 0) {
        //有仓位 初始化止损
        if (仓位数量 !== 0) {
            const 止损点 = 初始止损点()

            if (isNaN(止损点)) return false //波动率还没出来 不止损

            const side = 仓位数量 > 0 ? 'Sell' : 'Buy'

            //ws返回有时间  直接给委托列表加一条记录??
            await BitMEXOrderAPI.stop(self.cookie, {
                symbol,
                side,
                price: toGridPoint(symbol, 仓位数量 > 0 ? 开仓均价 - 止损点 : 开仓均价 + 止损点, side),
            })
            return true
        }
        else {
            return false
        }
    }
    //有止损
    else if (止损委托.length === 1) {
        //没有仓位 或者 止损方向错了
        if (仓位数量 === 0 || (仓位数量 > 0 && 止损委托[0].side !== 'Sell') || (仓位数量 < 0 && 止损委托[0].side !== 'Buy')) {
            //ws返回有时间  直接给委托列表加一条记录??
            await BitMEXOrderAPI.cancel(self.cookie, 止损委托.map(v => v.id))
            return true
        }
        else {
            //修改止损  只能改小  不能改大
            const { price, side, id } = 止损委托[0]
            const 浮盈点数 = self.get浮盈点数(symbol)

            const 推 = 推止损(浮盈点数)
            if (isNaN(推)) {
                return false
            }

            const 新的Price = toGridPoint(symbol, 开仓均价 + (side === 'Buy' ? - 推 : 推), side)

            if (
                (side === 'Buy' && 新的Price < price) ||
                (side === 'Sell' && 新的Price > price)
            ) {
                await BitMEXOrderAPI.updateStop(self.cookie, {
                    orderID: id,
                    price: 新的Price,
                })
                return true
            }
            return false
        }
    }
    else {
        //多个止损 全部清空
        //ws返回有时间  直接给委托列表加一条记录??
        await BitMEXOrderAPI.cancel(self.cookie, 止损委托.map(v => v.id))
        return true
    }
}