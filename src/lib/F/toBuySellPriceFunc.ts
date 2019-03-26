import { BaseType } from '../BaseType'

export const toBuySellPriceFunc = (side: BaseType.Side, f: () => number) => {
    let ret = NaN
    return () => {
        const n = f()
        ret = isNaN(ret) ? n : (side === 'Sell' ? Math.max(ret, n) : Math.min(ret, n))
        return ret
    }
}