import { BaseType } from '../BaseType'
import { fix浮点 } from './fix浮点'

export const to价格对齐 = ({ grid, side, value }: {
    grid: number
    side: BaseType.Side
    value: number
}) =>
    fix浮点((side === 'Buy' ? Math.floor : Math.ceil)(value / grid) * grid)
