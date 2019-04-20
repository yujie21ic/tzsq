import { toRange } from '../lib/F/toRange'
import { PositionAndOrderTask, PositionAndOrder } from '../lib/____API____/PositionAndOrder/PositionAndOrder'
import { BaseType } from '../lib/BaseType'
import { to价格对齐 } from '../lib/F/to价格对齐'


export class BTC止损 implements PositionAndOrderTask {

    开关 = false
    参数type = {
        止损点: 5
    }
    参数 = {
        止损点: 5
    }

    on参数更新?: () => void

    onFilled(p: { symbol: BaseType.BitmexSymbol, type: '限价' | '限价只减仓' | '止损' | '强平' }) {

    }

    onHopexTick(self: PositionAndOrder) {
        return true
    }

    onTick(self: PositionAndOrder) {



        const 止损点 = toRange({ min: 5, max: 100, value: this.参数.止损点 })
        if (this.参数.止损点 !== 止损点) {
            this.参数.止损点 = 止损点
            if (this.on参数更新 !== undefined) {
                this.on参数更新()
            }
        }

        const { 仓位数量, 开仓均价, 委托列表 } = self.jsonSync.rawData.market.hopex.ETHUSDT

        const 止损委托 = 委托列表.filter(v => v.type === '止损')

        //没有止损 
        if (止损委托.length === 0) {
            if (仓位数量 !== 0) {
                const side = 仓位数量 > 0 ? 'Sell' : 'Buy'
                return self.stop({
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
                return self.cancel({ orderID: 止损委托.map(v => v.id) })
            }
            else {
                return false
            }
        }
        else if (止损委托.length === 2 && 止损委托[0].side === 止损委托[1].side) {
            if (止损委托[0].side === 'Sell') {
                return self.cancel({ orderID: [止损委托[0].price < 止损委托[1].price ? 止损委托[0].id : 止损委托[1].id] })
            } else {
                return self.cancel({ orderID: [止损委托[0].price > 止损委托[1].price ? 止损委托[0].id : 止损委托[1].id] })
            }
        }
        else {
            return self.cancel({ orderID: 止损委托.map(v => v.id) })
        }
    }



}