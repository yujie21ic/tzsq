import { BaseType } from '../BaseType'

export const to价格对齐 = ({ grid, side, value }: { grid: number, side: BaseType.Side, value: number }) => {
    const ret = Math.floor(value / grid) * grid
    if (side === 'Buy') {       //ret <= value
        return ret
    }
    else {                      //ret>= value
        if (ret === value) {
            return value
        } else {
            return ret + grid
        }
    }
}