import { TopBottom } from './type'
export const combineTopAndBottom = (a: TopBottom, b: TopBottom) => ({
    top: Math.max(a.top, b.top),
    bottom: Math.min(a.bottom, b.bottom)
}) 