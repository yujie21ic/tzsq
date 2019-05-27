import { mapObjIndexed } from './mapObjIndexed'

//只支持 number boolean string object array(相同类型 可以多维)
//sample 不支持 key 是 __prototype__

export const typeObjectParse = <T>(sample: T) =>
    (data: any): T => {
        if (typeof sample === 'number' || typeof sample === 'boolean' || typeof sample === 'string') {

            if (typeof sample === 'number' && data === null) {
                return NaN as any //支持一下 NaN
            } else {
                return (typeof data === typeof sample) ? data : sample
            }
        }
        else if (sample instanceof Array) {
            const arr = data instanceof Array ? data : []
            return arr.map(typeObjectParse(sample[0])) as any
        }
        else if (sample instanceof Object) {
            const obj = (data instanceof Object) && (data instanceof Array === false) ? data : {}
            return mapObjIndexed((value, key) => typeObjectParse(value)(obj[key]), sample as any) as any
        }
        else {
            return {} as any
        }
    }