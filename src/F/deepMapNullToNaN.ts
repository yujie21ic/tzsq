import { mapObjIndexed } from './mapObjIndexed'

export const deepMapNullToNaN = (obj: any): any => {
    if (obj === null) {
        return NaN
    }
    else if (typeof obj === 'number' || typeof obj === 'string' || typeof obj === 'boolean') {
        return obj
    }
    else if (obj instanceof Array) {
        return obj.map(deepMapNullToNaN)
    }
    else if (obj instanceof Object) {
        return mapObjIndexed(deepMapNullToNaN, obj)
    }
}