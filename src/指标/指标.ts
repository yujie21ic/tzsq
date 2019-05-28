export namespace 指标 {

    export const macd = (arr: ArrayLike<number>, 单位时间: number) => {
        const _12 = EMA(arr, 12, 单位时间)
        const _26 = EMA(arr, 26, 单位时间)
        const DIF = map(() => Math.min(_12.length, _26.length), i => _12[i] - _26[i])
        const DEM = EMA(DIF, 9, 单位时间)
        const OSC = map(() => Math.min(DIF.length, DEM.length), i => DIF[i] - DEM[i])
        return { DIF, DEM, OSC }
    }

    export const 布林带 = (arr: ArrayLike<number>, 单位时间: number) => {

        const _20时间段的标准差 = 标准差(arr, 20, 单位时间)

        const 中轨 = SMA(arr, 20, 单位时间)

        const 上轨 = map(
            () => Math.min(中轨.length, _20时间段的标准差.length),
            i => 中轨[i] + 2 * _20时间段的标准差[i]
        )

        const 下轨 = map(
            () => Math.min(中轨.length, _20时间段的标准差.length),
            i => 中轨[i] - 2 * _20时间段的标准差[i]
        )

        return { 上轨, 中轨, 下轨 }
    }


    export const map = <T>(
        getLength: () => number,
        getValue: (i: number) => T,
    ): ArrayLike<T> => {

        const cache = [] as (T | undefined)[] //任意索引缓存 不需要连续
        let lastLength = 0

        const get = (_: any, key: any): any => {
            if (key === 'length') {
                lastLength = getLength()
                return lastLength
            } else {
                //索引
                const index = parseInt(String(key))

                //有缓存
                if (cache[index] !== undefined) {
                    if (index !== lastLength - 1) return cache[index]
                }

                //计算
                const ret = getValue(index)

                //缓存
                cache[index] = ret

                //返回
                return ret
            }
        }

        return new Proxy({}, { get })
    }


    const 指标 = (f: (p: {
        start: number
        end: number
        count: number
        arr: ArrayLike<number>
    }) => number) =>
        (arr: ArrayLike<number>, 多少秒: number, 单位时间: number) =>
            map(
                () => arr.length,
                i => {
                    const end = i
                    const count = 多少秒 * (1000 / 单位时间)
                    const start = end - count + 1
                    if (start >= 0) {
                        return f({ start, end, count, arr })
                    } else {
                        return NaN
                    }
                })


    export const SMA = 指标(({ start, end, count, arr }) => {
        let sum = 0
        for (let i = start; i <= end; i++) {
            sum += arr[i]
        }
        return sum / count
    })



    export const 标准差 = 指标(({ start, end, count, arr }) => {

        let sum = 0
        for (let i = start; i <= end; i++) {
            sum += arr[i]
        }
        const u = sum / count //平均值


        //
        let xxxx = 0
        for (let i = start; i <= end; i++) {
            xxxx += Math.pow(arr[i] - u, 2)
        }

        return Math.sqrt(xxxx / count)
    })


    export const EMA = 指标(({ start, end, count, arr }) => {
        const α = 2 / (count + 1)

        let ret = α * arr[start]
        for (let i = start + 1; i <= end; i++) {
            ret = α * arr[i] + (1 - α) * ret
        }
        return ret
    })

    export const 最高 = 指标(({ start, end, count, arr }) => {
        let ret = arr[start]
        for (let i = start + 1; i <= end; i++) {
            ret = Math.max(ret, arr[i])
        }
        return ret
    })


    export const 最低 = 指标(({ start, end, count, arr }) => {
        let ret = arr[start]
        for (let i = start + 1; i <= end; i++) {
            ret = Math.min(ret, arr[i])
        }
        return ret
    })


    export const 最高index = 指标(({ start, end, count, arr }) => {
        let ret = arr[start]
        let retIndex = start
        for (let i = start + 1; i <= end; i++) {
            if (arr[i] > ret) {
                ret = arr[i]
                retIndex = i
            }
        }
        return retIndex
    })


    export const 最低index = 指标(({ start, end, count, arr }) => {
        let ret = arr[start]
        let retIndex = start
        for (let i = start + 1; i <= end; i++) {
            if (arr[i] < ret) {
                ret = arr[i]
                retIndex = i
            }
        }
        return retIndex
    })

    export const 累加 = 指标(({ start, end, arr }) => {
        let sum = 0
        for (let i = start; i <= end; i++) {
            sum += arr[i]
        }
        return sum
    })

    export const 波动率 = 指标(({ start, end, arr }) => {
        let n = 0
        for (let i = start + 1; i <= end; i++) {
            n += Math.abs(arr[i] - arr[i - 1])
        }
        return n
    })

}