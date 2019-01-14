import { subtract } from 'ramda'

// //weighted moving average
// const WMA = (cycle: number) =>
// (arr: number[]) => {
//     let 分母 = 0
//     for (let i = 1; i <= cycle; i++) {
//         分母 += i
//     }

//     return arr.map((v, i) => {
//         if (i + 1 >= cycle) {
//             let 分子 = 0
//             for (let n = cycle; n >= 1; n--) {
//                 分子 += n * arr[i - (cycle - n)]
//             }
//             return 分子 / 分母
//         } else {
//             return NaN
//         }
//     })
// }


//simple moving average
// const SMA = (cycle: number) =>
//     (arr: number[]) => {
//         let cycle_sum = 0
//         return arr.map((v, i) => {
//             cycle_sum = (cycle_sum + v) - (i - cycle >= 0 ? arr[i - cycle] : 0)
//             if (i + 1 >= cycle) {
//                 return cycle_sum / cycle
//             } else {
//                 return NaN
//             }
//         })
//     }

//exponential moving average
const EMA = (cycle: number) =>
    (arr: number[]) => {
        if (arr.length === 0) return []

        const α = 2 / (cycle + 1)

        let ret = [arr[0]]
        for (let i = 1; i < arr.length; i++) {
            ret[i] = α * arr[i] + (1 - α) * ret[i - 1]
        }

        for (let i = 0; i < cycle - 1; i++) {
            ret[i] = NaN
        }
        return ret
    }



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