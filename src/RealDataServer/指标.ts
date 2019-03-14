export namespace 指标 {

    export const is交叉 = ({ a1, a2, b1, b2 }: { a1: number, a2: number, b1: number, b2: number }) => {
        if (isNaN(a1) || isNaN(a2) || isNaN(b1) || isNaN(b2)) {
            return false
        } else {
            return ((a1 > b1 && a2 > b2) || (a1 < b1 && a2 < b2)) === false
        }
    }

    export const macd = (arr: ArrayLike<number>, 单位时间: number) => {
        const _12 = EMA(arr, 12, 单位时间)
        const _26 = EMA(arr, 26, 单位时间)
        const DIF = lazyMapCache(() => Math.min(_12.length, _26.length), i => _12[i] - _26[i])
        const DEM = EMA(DIF, 9, 单位时间)
        return { DIF, DEM }
    }
    export const macd带参数 = (arr: ArrayLike<number>, 单位时间: number,快线:number,慢线:number) => {
        const _12 = EMA(arr, 快线, 单位时间)
        const _26 = EMA(arr, 慢线, 单位时间)
        const DIF = lazyMapCache(() => Math.min(_12.length, _26.length), i => _12[i] - _26[i])
        const DEM = EMA(DIF, 9, 单位时间)
        return { DIF, DEM }
    }

    export const lazyMapCache = <T>(
        getLength: () => number,
        getValue: (i: number) => T,
    ): ArrayLike<T> => {

        const cache = [] as (T | undefined)[] //任意索引缓存 不需要连续

        const get = (_: any, key: any): any => {
            if (key === 'length') {
                return getLength()
            } else {
                //索引
                const index = parseInt(String(key))

                //返回缓存
                if (cache[index] !== undefined) {
                    return cache[index]
                }

                //计算
                const ret = getValue(index)

                //不是最后一个就缓存
                if (index !== getLength() - 1) {
                    cache[index] = ret
                }

                //返回
                return ret
            }
        }

        return new Proxy({}, { get })
    }


    //批量计算
    export const lazyMapCache2 = <T, EXT>(
        ext: EXT,
        f: (arr: T[], ext: EXT) => void
    ): ArrayLike<T> => {

        const cache = [] as T[]

        const get = (_: any, key: any): any => {
            if (key === 'length') {
                f(cache, ext)
                return cache.length
            } else {
                return cache[parseInt(String(key))]
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
            lazyMapCache(
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


    export const 均线 = 指标(({ start, end, count, arr }) => {
        let sum = 0
        for (let i = start; i <= end; i++) {
            sum += arr[i]
        }
        return sum / count
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




    export const 阻力3 = (p: {
        price: ArrayLike<number>
        volumeBuy: ArrayLike<number>
        volumeSell: ArrayLike<number>
    }): {
        type: '最开始的平' | '涨' | '跌'
        开始点价格: number
        成交量累计: number
        价钱增量: number
        阻力: number
    }[] => {

        const cache: {
            type: '最开始的平' | '涨' | '跌'
            开始点价格: number
            成交量累计: number
            价钱增量: number
            阻力: number
        }[] = []

        const 初始化涨 = (i: number) => {
            const 开始点价格 = p.price[i - 1]
            const 成交量累计 = p.volumeBuy[i]
            const 价钱增量 = Math.abs(p.price[i] - 开始点价格)
            cache[i] = {
                type: '涨',
                开始点价格,
                成交量累计,
                价钱增量,
                阻力: Math.min(成交量累计 / 价钱增量, 10000000),
            }
        }

        const 继续涨 = (i: number) => {
            const { 开始点价格 } = cache[i - 1]
            const 成交量累计 = cache[i - 1].成交量累计 + p.volumeBuy[i]
            const 价钱增量 = Math.abs(p.price[i] - 开始点价格)
            cache[i] = {
                type: '涨',
                开始点价格,
                成交量累计,
                价钱增量,
                阻力: Math.min(成交量累计 / 价钱增量, 10000000),
            }
        }

        const 初始化跌 = (i: number) => {
            const 开始点价格 = p.price[i - 1]
            const 成交量累计 = -p.volumeSell[i]
            const 价钱增量 = Math.abs(p.price[i] - 开始点价格)
            cache[i] = {
                type: '跌',
                开始点价格,
                成交量累计,
                价钱增量,
                阻力: Math.max(成交量累计 / 价钱增量, -10000000),
            }
        }

        const 继续跌 = (i: number) => {
            const { 开始点价格 } = cache[i - 1]
            const 成交量累计 = cache[i - 1].成交量累计 - p.volumeSell[i]
            const 价钱增量 = Math.abs(p.price[i] - 开始点价格)
            cache[i] = {
                type: '跌',
                开始点价格,
                成交量累计,
                价钱增量,
                阻力: Math.max(成交量累计 / 价钱增量, -10000000),
            }
        }

        const get = (_: any, key: any): any => {
            const length = Math.min(p.price.length, p.volumeBuy.length, p.volumeSell.length)

            if (key === 'length') {
                return length
            } else {
                key = parseInt(String(key))
                if (key < cache.length - 1) return cache[key]

                for (let i = Math.max(0, cache.length - 1); i <= key; i++) {
                    if (i === 0) {
                        cache[i] = {
                            type: '最开始的平',
                            开始点价格: NaN,
                            成交量累计: NaN,
                            价钱增量: NaN,
                            阻力: NaN,
                        }
                    } else {

                        if (cache[i - 1].type === '最开始的平') {
                            if (p.price[i] > p.price[i - 1]) {
                                初始化涨(i)
                            } else if (p.price[i] < p.price[i - 1]) {
                                初始化跌(i)
                            } else {
                                cache[i] = {
                                    type: '最开始的平',
                                    开始点价格: NaN,
                                    成交量累计: NaN,
                                    价钱增量: NaN,
                                    阻力: NaN,
                                }
                            }
                        }
                        else if (cache[i - 1].type === '涨') {
                            (p.price[i] < p.price[i - 1] ? 初始化跌 : 继续涨)(i)
                        }
                        else if (cache[i - 1].type === '跌') {
                            (p.price[i] > p.price[i - 1] ? 初始化涨 : 继续跌)(i)
                        }
                    }
                }

                return cache[key]
            }
        }
        return new Proxy({}, { get })
    }



















}
