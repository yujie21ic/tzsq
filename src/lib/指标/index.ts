import { 画线LayerItem } from '../Chart/Layer/画线Layer'

export namespace 指标 {

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


    export const 阻力 = (p: {
        price: ArrayLike<number>
        volumeBuy: ArrayLike<number>
        volumeSell: ArrayLike<number>
    }): ArrayLike<number> => {

        const cache: {
            type: '最开始的平' | '涨' | '跌'
            开始点价格: number
            value: number
        }[] = []

        const 初始化涨 = (i: number) => {
            const 开始点价格 = p.price[i - 1]
            cache[i] = {
                type: '涨',
                开始点价格,
                value: p.volumeBuy[i] / Math.abs(p.price[i] - 开始点价格)
            }
        }

        const 继续涨 = (i: number) => {
            const { 开始点价格 } = cache[i - 1]
            cache[i] = {
                type: '涨',
                开始点价格,
                value: cache[i - 1].value + p.volumeBuy[i] / Math.abs(p.price[i] - 开始点价格)
            }
        }

        const 初始化跌 = (i: number) => {
            const 开始点价格 = p.price[i - 1]
            cache[i] = {
                type: '跌',
                开始点价格,
                value: -p.volumeSell[i] / Math.abs(p.price[i] - 开始点价格)
            }
        }

        const 继续跌 = (i: number) => {
            const { 开始点价格 } = cache[i - 1]
            cache[i] = {
                type: '跌',
                开始点价格,
                value: cache[i - 1].value - p.volumeSell[i] / Math.abs(p.price[i] - 开始点价格)
            }
        }

        const get = (_: any, key: any): any => {
            const length = Math.min(p.price.length, p.volumeBuy.length, p.volumeSell.length)

            if (key === 'length') {
                return length
            } else {
                key = parseInt(String(key))
                if (key < cache.length - 1) return cache[key].value

                for (let i = Math.max(0, cache.length - 1); i <= key; i++) {
                    if (i === 0) {
                        cache[i] = {
                            type: '最开始的平',
                            开始点价格: NaN,
                            value: 0,
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
                                    value: 0,
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

                return cache[key].value
            }
        }
        return new Proxy({}, { get })
    }

    export const lazyMapCache = <T>(
        getLength: () => number,
        getValue: (i: number) => T,
    ): ArrayLike<T> => {
        const cache = [] as (T | undefined)[]
        const get = (_: any, key: any): any => {
            if (key === 'length') {
                return getLength()
            }
            else {
                key = parseInt(String(key))
                if (cache[key] !== undefined) return cache[key]

                const ret = getValue(key)

                if (key !== getLength() - 1) {
                    cache[key] = ret
                }

                return ret
            }
        }
        return new Proxy({}, { get })
    }












    export const 阻力2 = (p: {
        价格: ArrayLike<number>
        价格均线: ArrayLike<number>
        成交量: ArrayLike<number>
        type: '涨' | '跌'
    }): ArrayLike<number> => {

        const cache: {
            type: '最开始的平' | '正' | '反'
            开始点价格: number
            成交量累计: number
            value: number
        }[] = []

        const 初始化正 = (i: number) => {
            const 开始点价格 = p.价格[i - 1]
            const 成交量累计 = p.成交量[i]

            cache[i] = {
                type: '正',
                开始点价格,
                成交量累计,
                value: 成交量累计 / Math.abs(p.价格[i] - 开始点价格)
            }
        }

        const 继续正 = (i: number) => {
            const { 开始点价格 } = cache[i - 1]
            const 成交量累计 = cache[i - 1].成交量累计 + p.成交量[i]

            cache[i] = {
                type: '正',
                开始点价格,
                成交量累计,
                value: 成交量累计 / Math.abs(p.价格[i] - 开始点价格)
            }
        }

        const get = (_: any, key: any): any => {
            const length = Math.min(p.价格.length, p.价格均线.length, p.成交量.length)

            if (key === 'length') {
                return length
            } else {
                key = parseInt(String(key))
                if (key < cache.length - 1) return cache[key].value

                for (let i = Math.max(0, cache.length - 1); i <= key; i++) {
                    if (i === 0) {
                        cache[i] = {
                            type: '最开始的平',
                            开始点价格: NaN,
                            成交量累计: NaN,
                            value: 0,
                        }
                    } else {
                        if (cache[i - 1].type === '最开始的平') {
                            if ((p.type === '涨' && p.价格[i] > p.价格[i - 1]) || (p.type === '跌' && p.价格[i] < p.价格[i - 1])) {
                                初始化正(i)
                            } else {
                                cache[i] = {
                                    type: '最开始的平',
                                    开始点价格: NaN,
                                    成交量累计: NaN,
                                    value: 0,
                                }
                            }
                        }
                        else if (cache[i - 1].type === '正') {
                            (((p.type === '涨' && p.价格[i] < p.价格均线[i]) || (p.type === '跌' && p.价格[i] > p.价格均线[i])) ? 初始化正 : 继续正)(i)
                        }
                    }
                }

                return cache[key].value
            }
        }
        return new Proxy({}, { get })
    }


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









    //价差平方
    export const 真空 = (p: {
        price: ArrayLike<number>
        volumeBuy: ArrayLike<number>
        volumeSell: ArrayLike<number>
    }): ArrayLike<number> => {

        const cache: {
            type: '最开始的平' | '涨' | '跌'
            开始点价格: number
            成交量累计: number
            value: number
        }[] = []

        const 初始化涨 = (i: number) => {
            const 开始点价格 = p.price[i - 1]
            const 成交量累计 = p.volumeBuy[i]
            cache[i] = {
                type: '涨',
                开始点价格,
                成交量累计,
                value: Math.pow(Math.abs(p.price[i] - 开始点价格), 2) / 成交量累计
            }
        }

        const 继续涨 = (i: number) => {
            const { 开始点价格 } = cache[i - 1]
            const 成交量累计 = cache[i - 1].成交量累计 + p.volumeBuy[i]
            cache[i] = {
                type: '涨',
                开始点价格,
                成交量累计,
                value: Math.pow(Math.abs(p.price[i] - 开始点价格), 2) / 成交量累计
            }
        }

        const 初始化跌 = (i: number) => {
            const 开始点价格 = p.price[i - 1]
            const 成交量累计 = -p.volumeSell[i]
            cache[i] = {
                type: '跌',
                开始点价格,
                成交量累计,
                value: Math.pow(Math.abs(p.price[i] - 开始点价格), 2) / 成交量累计
            }
        }

        const 继续跌 = (i: number) => {
            const { 开始点价格 } = cache[i - 1]
            const 成交量累计 = cache[i - 1].成交量累计 - p.volumeSell[i]
            cache[i] = {
                type: '跌',
                开始点价格,
                成交量累计,
                value: Math.pow(Math.abs(p.price[i] - 开始点价格), 2) / 成交量累计
            }
        }

        const get = (_: any, key: any): any => {
            const length = Math.min(p.price.length, p.volumeBuy.length, p.volumeSell.length)

            if (key === 'length') {
                return length
            } else {
                key = parseInt(String(key))
                if (key < cache.length - 1) return cache[key].value

                for (let i = Math.max(0, cache.length - 1); i <= key; i++) {
                    if (i === 0) {
                        cache[i] = {
                            type: '最开始的平',
                            开始点价格: NaN,
                            成交量累计: NaN,
                            value: 0,
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
                                    value: 0,
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

                return cache[key].value
            }
        }
        return new Proxy({}, { get })
    }






    const get趋势 = (price: ArrayLike<number>, index: number) => {

        let type: '' | '上涨' | '下跌' = ''
        let counter = 0
        let value = price[index]
        let endIndex = index


        for (let i = index + 1; i < price.length; i++) {
            const newValue = price[i]

            //初始化type
            if (type === '') {
                if (value < newValue) type = '上涨'
                else if (value > newValue) type = '下跌'
                else if (value === newValue) return index //起始不能是平
            }

            if (
                (type === '上涨' && value < newValue) ||
                (type === '下跌' && value > newValue)
            ) {
                value = newValue
                endIndex = i
            }
            else if (value === newValue) {
                counter += 1
                if (counter >= 4) { //2秒
                    break
                }
            }
            else {
                break
            }
        }
        return endIndex
    }


    export const 阻力笔 = (price: ArrayLike<number>): ArrayLike<画线LayerItem> => {

        const cache: 画线LayerItem[] = []
        let last笔index: number | undefined = undefined //没缓存

        const get = (_: any, key: any): any => {
            const length = price.length

            if (key === 'length') {
                return length
            } else {
                key = parseInt(String(key))

                if (last笔index !== undefined && key < last笔index) return cache[key]
                let nowIndex = last笔index === undefined ? 0 : last笔index

                while (true) {
                    const endIndex = get趋势(price, nowIndex)

                    //没有
                    if (endIndex === nowIndex) {
                        cache[endIndex] = {
                            leftDrawLineIndex: last笔index,
                        }
                        nowIndex += 1
                    }
                    else if (endIndex !== nowIndex) {
                        //

                        const y1 = price[nowIndex]
                        const y2 = price[endIndex]

                        cache[nowIndex] = {
                            drawLine: {
                                color: y2 > y1 ? 0x00ff00 : 0xff0000,
                                y1,
                                x2: endIndex,
                                y2,
                            },
                            leftDrawLineIndex: nowIndex === last笔index ? cache[nowIndex].leftDrawLineIndex : last笔index,
                        }

                        //没有
                        for (let i = nowIndex + 1; i <= endIndex; i++) {
                            cache[i] = {
                                leftDrawLineIndex: last笔index,
                            }
                        }

                        last笔index = nowIndex
                        nowIndex = endIndex
                    }

                    if (nowIndex > price.length - 1) break
                }


                // console.log(cache)
                return cache[key]
            }
        }
        return new Proxy({}, { get })
    }












    //
    export const 配置 = {
        type: '结束' as '结束' | '涨' | '跌',
        startIndex: 0
    }


    const NaNToInfinity = (n: number) => isNaN(n) ? Infinity : n
    const NaNTo_Infinity = (n: number) => isNaN(n) ? -Infinity : n


    //TODO
    export const 阻力4 = (p: {
        price: ArrayLike<number>
        volumeBuy: ArrayLike<number>
        volumeSell: ArrayLike<number>
    }): {
        开始点价格: number
        成交量累计: number
        价钱增量: number
        阻力: number
    }[] => {

        const cache: {
            开始点价格: number
            成交量累计: number
            价钱增量: number
            阻力: number
        }[] = []

        let 初始化涨了 = false
        let 初始化跌了 = false

        const 初始化涨 = (i: number) => {
            const 开始点价格 = p.price[i - 1]
            const 成交量累计 = p.volumeBuy[i]
            const 价钱增量 = Math.abs(p.price[i] - 开始点价格)
            cache[i] = {
                开始点价格,
                成交量累计,
                价钱增量,
                阻力: Math.min(NaNToInfinity(成交量累计 / 价钱增量), 10000000),
            }
            // console.log('初始化涨', i, cache[i])
        }

        const 继续涨 = (i: number) => {
            const { 开始点价格 } = cache[i - 1]
            const 成交量累计 = cache[i - 1].成交量累计 + p.volumeBuy[i]
            const 价钱增量 = Math.abs(p.price[i] - 开始点价格)
            cache[i] = {
                开始点价格,
                成交量累计,
                价钱增量,
                阻力: Math.min(NaNToInfinity(成交量累计 / 价钱增量), 10000000),
            }
        }

        const 初始化跌 = (i: number) => {
            const 开始点价格 = p.price[i - 1]
            const 成交量累计 = -p.volumeSell[i]
            const 价钱增量 = Math.abs(p.price[i] - 开始点价格)
            cache[i] = {
                开始点价格,
                成交量累计,
                价钱增量,
                阻力: Math.max(NaNTo_Infinity(成交量累计 / 价钱增量), -10000000),
            }
            // console.log('初始化跌', i, cache[i])
        }

        const 继续跌 = (i: number) => {
            const { 开始点价格 } = cache[i - 1]
            const 成交量累计 = cache[i - 1].成交量累计 - p.volumeSell[i]
            const 价钱增量 = Math.abs(p.price[i] - 开始点价格)
            cache[i] = {
                开始点价格,
                成交量累计,
                价钱增量,
                阻力: Math.max(NaNTo_Infinity(成交量累计 / 价钱增量), -10000000),
            }
        }

        const get = (_: any, key: any): any => {
            const length = Math.min(p.price.length, p.volumeBuy.length, p.volumeSell.length)

            if (key === 'length') {
                return length
            } else {
                key = parseInt(String(key))
                if (key < cache.length - 1) return cache[key]

                //没点
                if (配置.type === '结束') {
                    return {
                        开始点价格: NaN,
                        成交量累计: NaN,
                        价钱增量: NaN,
                        阻力: NaN,
                    }
                    初始化涨了 = false
                    初始化跌了 = false
                }

                for (let i = Math.max(0, cache.length - 1); i <= key; i++) {
                    if (i < 配置.startIndex) {
                        cache[i] = {
                            开始点价格: NaN,
                            成交量累计: NaN,
                            价钱增量: NaN,
                            阻力: NaN,
                        }
                        初始化涨了 = false
                        初始化跌了 = false
                    }
                    else if (i === 配置.startIndex) {
                        if (配置.type === '涨') {
                            初始化涨(i)
                            初始化涨了 = true
                        } else {
                            初始化跌(i)
                            初始化跌了 = true
                        }
                    }
                    else if (i > 配置.startIndex) {
                        if (配置.type === '涨') {
                            if (初始化涨了 === false) {
                                初始化涨(i)
                                初始化涨了 = true
                            } else {
                                继续涨(i)
                            }
                        } else {
                            if (初始化跌了 === false) {
                                初始化跌(i)
                                初始化跌了 = true
                            } else {
                                继续跌(i)
                            }
                        }
                    }
                }

                return cache[key]
            }
        }
        return new Proxy({}, { get })
    }




}
