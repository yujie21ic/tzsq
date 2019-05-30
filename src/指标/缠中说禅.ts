type HighLow = {
    index: number
    high: number
    low: number
}

const is包含关系 = (a: HighLow, b: HighLow) =>
    (a.high >= b.high && a.low <= b.low) ||
    (b.high >= a.high && b.low <= a.low)

const 向上处理 = (a: HighLow, b: HighLow) =>
    ({
        index: Math.max(a.index, b.index),
        high: Math.max(a.high, b.high),
        low: Math.max(a.low, b.low),
    })

const 向下处理 = (a: HighLow, b: HighLow) =>
    ({
        index: Math.max(a.index, b.index),
        high: Math.min(a.high, b.high),
        low: Math.min(a.low, b.low),
    })

const 非包含关系的3根K线完全分类 = (a: HighLow, b: HighLow, c: HighLow) => {
    const [k1, k2, k3] = [a.high, b.high, c.high]
    return k2 > k1 ? (k3 > k2 ? '上升K线' : '顶分型') : (k3 < k2 ? '下降K线' : '底分型')
}


//什么鬼？？？？？？？？？？
const K线包含处理 = (arr: ArrayLike<HighLow>) => {
    if (arr.length <= 1) return arr

    // (包含到下一根了 包含到下一根了 包含到下一根了 HighLow) 一根合并K线
    let ret: (HighLow | '包含到下一根了')[] = [arr[0]]

    //前面没有K线了  默认向上处理
    let lastH = 0

    //时间先后顺序来进行  先合并前面的  再合并后面的
    for (let i = 1; i < arr.length; i++) {
        const 这一根 = arr[i]
        const 上一根处理的 = ret[i - 1] as (HighLow | HighLow) //不会是null

        const bool = is包含关系(这一根, 上一根处理的)
        if (bool) {

            //不存在 上一根处理的.high === lastH 的情况
            //上一根处理的.high > lastH 不成立 直接就是  上一根处理的.low > lastL 了
            const func = 上一根处理的.high > lastH ? 向上处理 : 向下处理
            ret[i] = func(这一根, 上一根处理的)
            ret[i - 1] = '包含到下一根了' //合并后清空上一根
        } else {
            lastH = 上一根处理的.high //<------------ A  (BC合并)  (DE合并)   DE合并的 high  比 BC 合并的 high
            ret[i] = 这一根
        }
    }
    return ret.filter(v => v !== '包含到下一根了') as ArrayLike<HighLow>
}


const 笔的顶底需要隔几根K线 = 3  //不考虑包含关系，至少有3根（包括3根）以上K线 
const get笔 = (arr1: ArrayLike<HighLow>) => {
    let ret: { index: number, type: '顶分型' | '底分型', value: number }[] = []

    for (let i = 1; i < arr1.length - 1; i++) {
        const type = 非包含关系的3根K线完全分类(arr1[i - 1], arr1[i], arr1[i + 1])
        if (type === '顶分型' || type === '底分型') {
            if (ret.length === 0) {
                ret.push({
                    index: arr1[i].index,
                    type,
                    value: type === '顶分型' ? arr1[i].high : arr1[i].low
                })
            }
            else if (type !== ret[ret.length - 1].type) {
                if (type === '底分型' && arr1[i].low < ret[ret.length - 1].value) {
                    if (arr1[i].index > ret[ret.length - 1].index + 笔的顶底需要隔几根K线) {
                        ret.push({
                            index: arr1[i].index,
                            type,
                            value: arr1[i].low
                        })
                    }
                }
                else if (type === '顶分型' && arr1[i].high > ret[ret.length - 1].value) {
                    if (arr1[i].index > ret[ret.length - 1].index + 笔的顶底需要隔几根K线) {
                        ret.push({
                            index: arr1[i].index,
                            type,
                            value: arr1[i].high
                        })
                    }
                }
            } else {
                if (type === '底分型' && arr1[i].low < ret[ret.length - 1].value) {
                    if (arr1[i].index > ret[ret.length - 1].index + 笔的顶底需要隔几根K线) {
                        ret[ret.length - 1] = {
                            index: arr1[i].index,
                            type,
                            value: arr1[i].low
                        }
                    }
                }
                else if (type === '顶分型' && arr1[i].high > ret[ret.length - 1].value) {
                    if (arr1[i].index > ret[ret.length - 1].index + 笔的顶底需要隔几根K线) {
                        ret[ret.length - 1] = {
                            index: arr1[i].index,
                            type,
                            value: arr1[i].high
                        }
                    }
                }
            }

        }
    }
    return ret
}





export const getXXX = (arr3: { high: number, low: number }[]) => {
    const arr2 = arr3.map((v, i) => ({
        index: i,
        high: v.high,
        low: v.low,
    }))

    const 笔 = get笔(K线包含处理(arr2))

    const 上: HighLow[] = []
    const 下: HighLow[] = []
    笔.forEach((v, i) => {
        if (i !== 0) {
            if (v.type === '顶分型') {
                上.push({
                    index: v.index,
                    high: v.value,
                    low: 笔[i - 1].value,
                })
            }
            else if (v.type === '底分型') {
                下.push({
                    index: v.index,
                    high: 笔[i - 1].value,
                    low: v.value,
                })
            }
        }
    })
    const 包含上 = K线包含处理(上)
    const 包含下 = K线包含处理(下)
    const 线段1 = get笔(包含上)
    const 线段2 = get笔(包含下)

    return [笔, 线段1, 线段2]
} 