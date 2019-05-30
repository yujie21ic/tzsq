type HighLow = {
    high: number
    low: number
}

const is包含关系 = (a: HighLow, b: HighLow) =>
    (a.high >= b.high && a.low <= b.low) || (b.high >= a.high && b.low <= a.low)

const 包含处理 = (f: (a: number, b: number) => number) =>
    (a: HighLow, b: HighLow) =>
        ({
            high: f(a.high, b.high),
            low: f(a.low, b.low),
        })
const 向上处理 = 包含处理(Math.max)
const 向下处理 = 包含处理(Math.min)

const 非包含关系的3根K线完全分类 = (a: HighLow, b: HighLow, c: HighLow) => {
    const [k1, k2, k3] = [a.high, b.high, c.high]
    return k2 > k1 ? (k3 > k2 ? '上升K线' : '顶分型') : (k3 < k2 ? '下降K线' : '底分型')
}



//什么鬼？？？？？？？？？？
const K线包含处理 = (arr: HighLow[]) => {
    if (arr.length <= 1) return arr

    // (看下一根 看下一根 看下一根 HighLow) 一根合并K线
    let ret: (HighLow | '看下一根')[] = [arr[0]]

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
            ret[i - 1] = '看下一根' //合并后清空上一根
        } else {
            lastH = 上一根处理的.high //<------------ A  (BC合并)  (DE合并)   DE合并的 high  比 BC 合并的 high
            ret[i] = 这一根
        }
    }
    return ret
}



const 笔的顶底需要隔几根K线 = 3  //小周期3  大周期2 (合并后的K线的 index 用后面那个) 
//什么鬼？？？？？？？？？？？？？？？？？
export const 合并后的K线 = (arr2: ArrayLike<HighLow>) => {
    const arr: HighLow[] = []
    for (let i = 0; i < arr2.length; i++)arr.push(arr2[i])



    let ret: ({ startIndex: number, endIndex: number } & HighLow)[] = []
    let startIndex = NaN

    K线包含处理(arr).forEach((v, i) => {
        if (isNaN(startIndex)) {
            if (v === '看下一根') {
                startIndex = i
            }
        } else {
            if (v !== '看下一根') {
                ret.push({ startIndex, endIndex: i, high: v.high, low: v.low })
                startIndex = NaN
            }
        }
    })

    return ret
}



/*
 
4、新笔定义：本ID想了想，计算了一下能量力度，觉得以后可以把笔的成立条件略微放松一下，就是一笔必须满足以下两个条件：
 
1、顶分型与底分型经过包含处理后，不允许共用K线，也就是不能有一K线分别属于顶分型与底分型，这条件和原来是一样的，
这一点绝对不能放松，因为这样，才能保证足够的能量力度；
 
2、在满足1的前提下，顶分型中最高K线和底分型的最低K线之间（不包括这两K线），
不考虑包含关系，至少有3根（包括3根）以上K线。显然，
第二个条件，比原来分型间必须有独立K线的一条，要稍微放松了一点，这样，象今天绿箭头所指的地方，就是一笔了，
相应那三笔下来就构成一段了，整个划分就不会出现比较古怪的线段。
 
*/
export const get笔Index = (arr2: ArrayLike<HighLow>) => {

    const arr: HighLow[] = []
    for (let i = 0; i < arr2.length; i++)arr.push(arr2[i])

    const arr1 = K线包含处理(arr) //包含处理 
        .map((v, i) => ({ index: i, value: v })) //加上索引
        .filter(v => v.value !== '看下一根') //过滤空的 
        .map(v => v as { index: number, value: HighLow })//类型移除看下一根


    let ret: { index: number, type: '顶分型' | '底分型', value: number }[] = []

    for (let i = 1; i < arr1.length - 1; i++) {
        const type = 非包含关系的3根K线完全分类(arr1[i - 1].value, arr1[i].value, arr1[i + 1].value)
        if (type === '顶分型' || type === '底分型') {
            if (ret.length === 0) {
                ret.push({
                    index: arr1[i].index,
                    type,
                    value: type === '顶分型' ? arr1[i].value.high : arr1[i].value.low
                })
            }
            else if (type !== ret[ret.length - 1].type) {
                if (type === '底分型' && arr1[i].value.low < ret[ret.length - 1].value) {
                    if (arr1[i].index > ret[ret.length - 1].index + 笔的顶底需要隔几根K线) {
                        ret.push({
                            index: arr1[i].index,
                            type,
                            value: arr1[i].value.low
                        })
                    }
                }
                else if (type === '顶分型' && arr1[i].value.high > ret[ret.length - 1].value) {
                    if (arr1[i].index > ret[ret.length - 1].index + 笔的顶底需要隔几根K线) {
                        ret.push({
                            index: arr1[i].index,
                            type,
                            value: arr1[i].value.high
                        })
                    }
                }
            } else {
                if (type === '底分型' && arr1[i].value.low < ret[ret.length - 1].value) {
                    if (arr1[i].index > ret[ret.length - 1].index + 笔的顶底需要隔几根K线) {
                        ret[ret.length - 1] = {
                            index: arr1[i].index,
                            type,
                            value: arr1[i].value.low
                        }
                    }
                }
                else if (type === '顶分型' && arr1[i].value.high > ret[ret.length - 1].value) {
                    if (arr1[i].index > ret[ret.length - 1].index + 笔的顶底需要隔几根K线) {
                        ret[ret.length - 1] = {
                            index: arr1[i].index,
                            type,
                            value: arr1[i].value.high
                        }
                    }
                }
            }

        }
    }
    return ret
} 