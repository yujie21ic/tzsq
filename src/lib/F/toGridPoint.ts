import { to价格对齐 } from './to价格对齐'
import { BaseType } from '../BaseType'


export const toGridPoint = (symbol: BaseType.BitmexSymbol, value: number, side: BaseType.Side) => {
    const grid = symbol === 'XBTUSD' ? 0.5 : 0.05
    return to价格对齐({ grid, side, value })
}