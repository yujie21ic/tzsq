//weighted moving average

export const WMA = (cycle: number) =>
    (arr: number[]) => {
        let 分母 = 0
        for (let i = 1; i <= cycle; i++) {
            分母 += i
        }

        return arr.map((v, i) => {
            if (i + 1 >= cycle) {
                let 分子 = 0
                for (let n = cycle; n >= 1; n--) {
                    分子 += n * arr[i - (cycle - n)]
                }
                return 分子 / 分母
            } else {
                return NaN
            }
        })
    }