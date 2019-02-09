import { BaseType } from '../../lib/BaseType'
import { Account } from '../Account'

export const 自动交易step = (symbol: BaseType.BitmexSymbol) => async (self: Account) => {

    if (self.jsonSync.rawData.symbol[symbol].自动交易 === false) {
        return true
    }

    //信号灯亮 挂单  
    //开仓成功了  挂止盈 波动率/10+5

    //提前 修改 止盈
    //触发了反向开仓信号


    return true
} 