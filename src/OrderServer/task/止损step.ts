import { BaseType } from '../../lib/BaseType'
import { Account } from '../Account'
import { get波动率 } from '../realData'
import { to范围 } from '../../lib/F/to范围'
import { toGridPoint } from '../../lib/F/toGridPoint'

const 止损step = ({
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

    const path = self.accountName + '.txt'

    //没有止损 
    if (止损委托.length === 0) {
        //有仓位 初始化止损
        if (仓位数量 !== 0) {
            const 止损点 = 初始止损点()

            if (isNaN(止损点)) return false //波动率还没出来 不止损

            const side = 仓位数量 > 0 ? 'Sell' : 'Buy'

            //ws返回有时间  直接给委托列表加一条记录??            
            return await self.order自动.stop({
                symbol,
                side,
                price: toGridPoint(symbol, 仓位数量 > 0 ? 开仓均价 - 止损点 : 开仓均价 + 止损点, side),
            }, { path, text: '止损step 初始化止损' })
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
            return await self.order自动.cancel(止损委托.map(v => v.id), { path, text: '止损step 取消止损' })
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
                return await self.order自动.updateStop({
                    orderID: id,
                    price: 新的Price,
                }, { path, text: '止损step 修改止损' })
            }
            return false
        }
    }
    else {
        //多个止损 全部清空
        //ws返回有时间  直接给委托列表加一条记录??       
        return await self.order自动.cancel(止损委托.map(v => v.id), { path, text: '止损step 取消多个止损' })
    }
}

export const XBTUSD止损step = 止损step({
    symbol: 'XBTUSD',
    初始止损点: () => to范围({
        min: 3,
        max: 18,
        value: get波动率('XBTUSD') / 6+4,
    }),
    推止损: 盈利点 => {
        const 波动率 = get波动率('XBTUSD')
        if (盈利点 >= to范围({ min: 5, max: 30, value: 波动率 / 5 + 6 })) {
            return 6
        }
        else if (盈利点 >= to范围({ min: 5, max: 15, value: 波动率 / 10 + 5 })) {
            return 0
        } else {
            return NaN
        }
    }
})

export const ETHUSD止损step = 止损step({
    symbol: 'ETHUSD',
    初始止损点: () => to范围({
        min: 0.3,
        max: 0.9,
        value: get波动率('ETHUSD') / 10 + 0.2,
    }),
    推止损: 盈利点 => {
        const 波动率 = get波动率('ETHUSD')
        if (盈利点 >= to范围({ min: 0.3, max: 3, value: 波动率 / 5 + 0.3 })) {
            return 0.2
        }
        else if (盈利点 >= to范围({ min: 0.3, max: 1.5, value: 波动率 / 10 + 0.3 })) {
            return 0
        } else {
            return NaN
        }
    }
})