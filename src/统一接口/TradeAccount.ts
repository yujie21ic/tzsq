import { BaseType } from '../lib/BaseType'
import { sleep } from '../lib/C/sleep'
import { BitmexPositionAndOrder } from './PositionAndOrder/BitmexPositionAndOrder'
import { RealData__Server } from '../RealDataServer/RealData__Server'
import { RealDataBase } from '../RealDataServer/RealDataBase'


export class TradeAccount extends BitmexPositionAndOrder {

    static realData: RealDataBase = new RealData__Server(false)


    async runTask(func: (self: TradeAccount) => Promise<boolean>) {
        while (true) {
            if (await func(this)) {
                await sleep(2000) //发了请求 休息2秒  TODO 改成事务 不用sleep
            }
            await sleep(100)
        }
    }

    get浮盈点数(symbol: BaseType.BitmexSymbol) {
        const 最新价 = TradeAccount.realData.期货价格dic.get(symbol)
        if (最新价 === undefined) return NaN
        const { 仓位数量, 开仓均价 } = this.jsonSync.rawData.symbol[symbol]
        if (仓位数量 === 0) return NaN
        if (仓位数量 > 0) {
            return 最新价 - 开仓均价
        } else if (仓位数量 < 0) {
            return 开仓均价 - 最新价
        } else {
            return 0
        }
    }

}