import { TopBottom } from './type'
export const combineTopAndBottom = (a: TopBottom, b: TopBottom) => ({
    top: Math.max(a.top, b.top),
    bottom: Math.min(a.bottom, b.bottom)
})


export const combineTopAndBottom正负 = (a: TopBottom, b: TopBottom) => {
    const v = Math.max(
        Math.abs(a.top),
        Math.abs(a.bottom),
        Math.abs(b.top),
        Math.abs(b.bottom)
    )
    return {
        top: v,
        bottom: -v
    }
}