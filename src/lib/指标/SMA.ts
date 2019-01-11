//simple moving average

export const SMA = (cycle: number) =>
    (arr: number[]) => {
        let cycle_sum = 0
        return arr.map((v, i) => {
            cycle_sum = (cycle_sum + v) - (i - cycle >= 0 ? arr[i - cycle] : 0)
            if (i + 1 >= cycle) {
                return cycle_sum / cycle
            } else {
                return NaN
            }
        })
    }