//exponential moving average

export const EMA = (cycle: number) =>
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