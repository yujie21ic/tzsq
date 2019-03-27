import { to价格对齐 } from './to价格对齐'
import { BaseType } from '../BaseType'


export const toGridPoint = ({ grid, value, side }: { grid: number, value: number, side: BaseType.Side }) =>
    to价格对齐({ grid, side, value })