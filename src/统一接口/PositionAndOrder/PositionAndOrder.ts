import { BaseType } from '../../lib/BaseType'

export interface PositionAndOrder {

}

export interface PositionAndOrderTask {
    onTick(self: PositionAndOrder): Promise<boolean>
    onFilled(p: { symbol: BaseType.BitmexSymbol, type: '限价' | '限价只减仓' | '止损' | '强平' }): void
}