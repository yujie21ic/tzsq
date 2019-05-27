import { LeftRight, TopBottom } from './type'
export const getTopAndBottom = (data: ArrayLike<number>) => ({ left, right }: LeftRight): TopBottom => {

    //let top = Number.MIN_VALUE
    let top = -Number.MAX_VALUE   //fix ....... 


    let bottom = Number.MAX_VALUE

    //start
    for (let i = Math.max(0, Math.floor(left)); i <= Math.min(Math.round(right), data.length - 1); i++) {
        const n = data[i]
        if (isNaN(n) === false) {
            top = Math.max(top, n)
            bottom = Math.min(bottom, n)
        }
    }
    //end


    return { top, bottom }
}



export const getTopAndBottomK = (data: ArrayLike<{ high: number, low: number }>) => ({ left, right }: LeftRight) => {
    let max = -Number.MIN_VALUE
    let min = Number.MAX_VALUE

    //start
    for (let i = Math.max(0, Math.floor(left)); i <= Math.min(Math.round(right), data.length - 1); i++) {
        if (isNaN(data[i].high) === false) {
            max = Math.max(max, data[i].high)
        }
        if (isNaN(data[i].low) === false) {
            min = Math.min(min, data[i].low)
        }
    }
    //end

    if (max === min) {
        max += 0.1
        min -= 0.1
    }

    const top = max + (max - min) * 0.05
    const bottom = min - (max - min) * 0.05

    return { top, bottom }
}