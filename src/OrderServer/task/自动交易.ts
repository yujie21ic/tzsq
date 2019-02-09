import { BaseType } from '../../lib/BaseType'
import { Account } from '../Account'


export const 自动交易step = (symbol: BaseType.BitmexSymbol) => async (self: Account) => {

    if (self.jsonSync.rawData.symbol[symbol].自动交易 === false) {
        return true
    }

    return true
} 