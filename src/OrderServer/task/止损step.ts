import { BaseType } from '../../lib/BaseType'
import { Account } from '../Account'
import { BitMEXOrderAPI } from '../../lib/BitMEX/BitMEXOrderAPI'
import { to价格对齐 } from '../../lib/F/to价格对齐'

const toGridPoint = (symbol: BaseType.BitmexSymbol, value: number, side: BaseType.Side) => {
    const grid = symbol === 'XBTUSD' ? 0.5 : 0.05
    return to价格对齐({ grid, side, value })
}

export const 止损step = (symbol: BaseType.BitmexSymbol, 初始止损点: () => number) => async (self: Account) => {
    const { 仓位数量, 开仓均价 } = self.jsonSync.rawData.symbol[symbol]
    const 止损委托 = self.jsonSync.rawData.symbol[symbol].活动委托.filter(v => v.type === '止损')

    //没有止损 
    if (止损委托.length === 0) {
        //有仓位 初始化止损
        if (仓位数量 !== 0) {
            const 止损点 = 初始止损点()

            if (isNaN(止损点)) return false //波动率还没出来 不止损

            const side = 仓位数量 > 0 ? 'Sell' : 'Buy'

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
        //止损方向错了
        if ((仓位数量 > 0 && 止损委托[0].side !== 'Sell') || (仓位数量 < 0 && 止损委托[0].side !== 'Buy')) {
            await BitMEXOrderAPI.cancel(self.cookie, 止损委托.map(v => v.id))
            return true
        }
        else {
            //只写了BTC的
            //修改止损  只能改小  不能改大
            // const { price, side, id } = arr[0]
            // const 浮盈点数 = self.get浮盈点数(symbol)
            // let 新的Price = NaN

            // if (浮盈点数 > 7) {
            //     新的Price = toGridPoint(symbol, 开仓均价, side)
            // }
            // else if (浮盈点数 > 15) {
            //     新的Price = toGridPoint(symbol, 开仓均价 + (side === 'Buy' ? - 3 : 3), side)
            // }

            // if (isNaN(新的Price)) {
            //     return false
            // }
            // else if (
            //     (side === 'Buy' && 新的Price < price) ||
            //     (side === 'Sell' && 新的Price > price)
            // ) {
            //     await BitMEXOrderAPI.updateStop(self.cookie, {
            //         orderID: id,
            //         price: 新的Price,
            //     })
            //     return true
            // }
            return false
        }
    }
    else {
        //多个止损 全部清空
        await BitMEXOrderAPI.cancel(self.cookie, 止损委托.map(v => v.id))
        return true
    }
}