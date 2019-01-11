import { subtract } from 'ramda'
import { EMA } from './EMA'

const map_a_b = (f: (a: number, b: number) => number) => (a: number[], b: number[]) =>
    a.map((_, i) => f(a[i], b[i]))

const 减 = map_a_b(subtract)

const EMA9 = EMA(9)
const EMA12 = EMA(12)
const EMA26 = EMA(26)


//moving average convergence divergence

export const MACD = (arr: number[]) => {
    const DIF = 减(EMA12(arr), EMA26(arr))
    const DEM = [...new Array(25).fill(NaN), ...EMA9(DIF.slice(25))]//!!!!!!
    const OSC = 减(DIF, DEM)
    return {
        DIF, DEM, OSC
    }
}