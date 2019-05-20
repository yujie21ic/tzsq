import { TradeAndOrderBook } from './TradeAndOrderBook'
import { BaseType } from '../../lib/BaseType'

export class DeribitTradeAndOrderBook extends TradeAndOrderBook<BaseType.BitmexSymbol> {

    name = 'deribit'

    constructor() {
        super()
    }
}