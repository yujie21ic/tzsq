import { PositionAndOrder } from './lib/____API____/PositionAndOrder/PositionAndOrder'
import { BaseType } from './lib/BaseType'
import { lastNumber } from './lib/F/lastNumber'
import { PositionAndOrderTask } from './lib/____API____/PositionAndOrder/PositionAndOrder'
import { toRange } from './lib/F/toRange'
import { to价格对齐 } from './lib/F/to价格对齐'

const 初始止损 = (p: {
    波动率: number
}) => toRange({
    min: 0.5,
    max: 1,
    value: p.波动率 / 10,
})

export class Hopex__ETH止损 implements PositionAndOrderTask {

    onFilled(p: { symbol: BaseType.BitmexSymbol, type: '限价' | '限价只减仓' | '止损' | '强平' }) {

    }

    onHopexTick(self: PositionAndOrder) {

        const { 仓位数量, 开仓均价, 任务开关, 委托列表 } = self.jsonSync.rawData.symbol.Hopex_ETH

        if (任务开关.自动止损 === false) return false

        const 止损委托 = 委托列表.filter(v => v.type === '止损')

        const 波动率 = lastNumber(self.realData.dataExt.ETHUSD.hopex.价格_波动率30)



        //没有止损 
        if (止损委托.length === 0) {

            //有仓位 初始化止损
            if (仓位数量 !== 0) {
                const 止损点 = 初始止损({ 波动率 })

                if (isNaN(止损点)) return false //波动率还没出来 不止损

                const side = 仓位数量 > 0 ? 'Sell' : 'Buy'

                return self.hopex_stop({
                    symbol: 'ETHUSDT',
                    side,
                    price: to价格对齐({
                        grid: 0.05,
                        value: 仓位数量 > 0 ? 开仓均价 - 止损点 : 开仓均价 + 止损点,
                        side,
                    }),
                })
            }
            else {
                return false
            }
        }
        //有止损
        else if (止损委托.length === 1) {
            //没有仓位 或者 止损方向错了
            if (仓位数量 === 0 || (仓位数量 > 0 && 止损委托[0].side !== 'Sell') || (仓位数量 < 0 && 止损委托[0].side !== 'Buy')) {
                return self.hopex_cancel({ symbol: 'ETHUSDT', orderID: 止损委托[0].id })
            }
            else {
                //不要推止损
                if (任务开关.自动推止损 === false) return false
                return false
            }
        }
        else if (止损委托.length === 2 && 止损委托[0].side === 止损委托[1].side) {
            if (止损委托[0].side === 'Sell') {
                return self.hopex_cancel({ symbol: 'ETHUSDT', orderID: 止损委托[0].price < 止损委托[1].price ? 止损委托[0].id : 止损委托[1].id })
            } else {
                return self.hopex_cancel({ symbol: 'ETHUSDT', orderID: 止损委托[0].price > 止损委托[1].price ? 止损委托[0].id : 止损委托[1].id })
            }
        }
        else {
            return self.hopex_cancel({ symbol: 'ETHUSDT', orderID: 止损委托[0].id })
        }
    }

    onTick(self: PositionAndOrder) {
        return true
    }



}