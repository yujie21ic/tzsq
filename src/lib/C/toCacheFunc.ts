//普通函数   转换成   缓存函数返回值的函数  相同参数只调用一遍
//函数参数 不能是 对象
export const toCacheFunc = <F extends (...p: any) => any>(f: F) => {
    const dic = new Map<string, any>()
    return ((...p: any) => {
        const key = JSON.stringify(p)
        if (dic.has(key) === false) {
            dic.set(key, f(...p))
        }
        return dic.get(key)
    }) as F
}