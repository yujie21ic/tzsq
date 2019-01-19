import { BaseType } from '../BaseType'

const fix浮点 = (n: number) => Number(n.toFixed(5))

export const to价格对齐 = ({ grid, side, value }: { grid: number, side: BaseType.Side, value: number }) => {
    const ret = Math.floor(value / grid) * grid
    if (side === 'Buy') {       //ret <= value
        return fix浮点(ret)
    }
    else {                      //ret>= value
        if (ret === value) {
            return fix浮点(value)
        } else {
            return fix浮点(ret + grid)
        }
    }
}