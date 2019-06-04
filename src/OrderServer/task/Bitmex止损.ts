import { PositionAndOrderTask, PositionAndOrder } from '../PositionAndOrder'
import { BaseType } from '../../BaseType'
import { to价格对齐 } from '../../F/to价格对齐'
import { sleep } from '../../F/sleep'


export class Bitmex止损 implements PositionAndOrderTask {

    开关 = false
    参数type = {
        止损: 0,
    }
    参数 = {
        止损: 0,
    }

    on参数更新?: () => void

    onFilled(p: { symbol: BaseType.BitmexSymbol, type: '限价' | '限价只减仓' | '止损' | '强平' }) {

    }

    private symbol: BaseType.BitmexSymbol

    constructor(symbol: BaseType.BitmexSymbol) {
        this.symbol = symbol
    }

    private async run1(self: PositionAndOrder) {
        while (true) {
            if (this.开关) {
                if (self.bitmex_初始化.仓位 && self.bitmex_初始化.委托) {
                    if (await this.onTick(self)) {
                        await sleep(2000) //发了请求 休息2秒  TODO 改成事务 不用sleep
                    }
                }
            }
            await sleep(100)
        }
    }

    run(self: PositionAndOrder) {
        this.run1(self)
    }

    onTick(self: PositionAndOrder) {

        const 止损点 = this.参数.止损

        const { 仓位数量, 开仓均价, 委托列表 } = self.jsonSync.rawData.market.bitmex[this.symbol]

        const 止损委托 = 委托列表.filter(v => v.type === '止损')

        if (止损点 === 0) {
            if (止损委托.length !== 0) {
                return self.cancel({ orderID: 止损委托.map(v => v.id) })
            } else {
                return false
            }
        }

        const side = 仓位数量 > 0 ? 'Sell' : 'Buy'
        const 止损价格 = to价格对齐({
            grid: this.symbol === 'XBTUSD' ? 0.5 : 0.05,
            value: 仓位数量 > 0 ? 开仓均价 - 止损点 : 开仓均价 + 止损点,
            side,
        })

        //没有止损 
        if (止损委托.length === 0) {
            if (仓位数量 !== 0) {
                return self.stop({
                    symbol: this.symbol,
                    side,
                    price: 止损价格,
                })
            }
            else {
                return false
            }
        }
        //有止损
        else if (止损委托.length === 1) {
            //止损方向错了
            if (仓位数量 === 0 || (仓位数量 > 0 && 止损委托[0].side !== 'Sell') || (仓位数量 < 0 && 止损委托[0].side !== 'Buy')) {
                return self.cancel({ orderID: 止损委托.map(v => v.id) })
            }
            //止损价格错了
            else if (止损委托[0].price !== 止损价格) {
                return self.updateStop({ orderID: 止损委托[0].id, price: 止损价格 })
            }
            else {
                return false
            }
        }
        //多个止损 全取消
        else {
            return self.cancel({ orderID: 止损委托.map(v => v.id) })
        }
    }



}