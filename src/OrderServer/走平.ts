import { realData } from './realData'
import { BaseType } from '../lib/BaseType'

const 走平 = <T extends string>(getPrice: (symbol: T) => number) => (p: {
    symbol: T
    side: BaseType.Side
    超时秒: number
    走平秒: number
    偏移: number
}) => new Promise<boolean>(resolve => {

    let 新高低 = getPrice(p.symbol)

    if (isNaN(新高低)) {
        resolve(false) //查找价格失败
        return
    }

    let hasResolve = false

    //超时失败
    setTimeout(() => {
        if (hasResolve === false) {
            hasResolve = true
            token.unsubscribe()
            resolve(false)
        }
    }, p.超时秒 * 1000)

    let ms计时: any
    const 走平计时 = () => {
        clearTimeout(ms计时)
        ms计时 = setTimeout(() => {
            //成功了
            if (hasResolve === false) {
                hasResolve = true
                token.unsubscribe()
                resolve(true)
            }
        }, p.走平秒 * 1000)
    }

    走平计时() //初始计时

    const token = realData.priceObservable.subscribe(v => {
        if (v.symbol === p.symbol) {
            if ((p.side === 'Buy' && v.price < 新高低 - p.偏移) || (p.side === 'Sell' && v.price > 新高低 + p.偏移)) {
                新高低 = v.price
                走平计时()
            }
        }
    })
})

export const 现货走平X = 走平<BaseType.BinanceSymbol>(symbol => {
    const n = realData.现货价格dic.get(symbol)
    return n === undefined ? NaN : n
})

export const 期货走平X = 走平<BaseType.BitmexSymbol>(symbol => {
    const n = realData.期货价格dic.get(symbol)
    return n === undefined ? NaN : n
})