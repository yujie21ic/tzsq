//普通函数   转换成   缓存函数返回值的函数  相同参数只调用一遍
const stringify = require('json-stable-stringify')

export const toCacheFunc = <F extends (...p: any) => any>(f: F) => {
    const dic = new Map<string, any>()
    return ((...p: any) => {
        const key = stringify(p)
        if (dic.has(key) === false) {
            dic.set(key, f(...p))
        }
        return dic.get(key)
    }) as F
}