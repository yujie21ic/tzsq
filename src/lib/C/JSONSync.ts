import { mapObjIndexed } from '../F/mapObjIndexed'
import { Subject } from 'rxjs'

type PATH = (string | number)[]
type OP = { path: PATH, value: any }


type MAPTO<T> = {
    [K in keyof T]:
    T[K] extends number | string | boolean ? {
        ____set: (v: T[K]) => void
    } :
    T[K] extends Array<infer TT> ? {
        ____set: (v: Array<TT>) => void
        ____push: (v: TT) => void
        ____updateLast: (v: TT) => void
    } :
    T[K] extends Object ? MAPTO<T[K]> : never
}


export class JSONSync<T>{
    rawData: T

    data: MAPTO<T>

    subject = new Subject<OP>()

    private mapJSON = (path: string[]): any => {
        const v = this.get(path)
        if (typeof v === 'number' || typeof v === 'string' || typeof v === 'boolean') {
            return {
                ____set: (value: any) => this.set({ path, value }),
            }
        }
        else if (v instanceof Array) {
            return {
                ____set: (value: any) => this.set({ path, value }),
                ____push: (value: any) => {
                    this.set({ path: [...path, this.get(path).length], value })
                },
                ____updateLast: (value: any) => {
                    this.set({ path: [...path, this.get(path).length - 1], value })
                }
            }
        } else if (v instanceof Object) {
            return mapObjIndexed((_, key) => this.mapJSON([...path, key]), v)
        } else {
            return {}
        }
    }

    constructor(data: T) { //可变数据  会改变传过来的数据
        this.rawData = data
        this.data = this.mapJSON([])
    }

    set({ path, value }: OP) {
        if (path.length === 0) {
            this.rawData = value
        }
        else if (path.length === 1) {
            (this.rawData as any)[path[0]] = value
        }
        else {
            const key = path[path.length - 1]
            const obj = path.reduce((last: any, current, i) => i === path.length - 1 ? last : last[current], this.rawData)
            obj[key] = value
        }
        this.subject.next({ path, value })
    }

    private get(path: PATH) {
        if (path.length === 0) {
            return this.rawData
        }
        else if (path.length === 1) {
            return (this.rawData as any)[path[0]]
        }
        else {
            const key = path[path.length - 1]
            const obj = path.reduce((last: any, current, i) => i === path.length - 1 ? last : last[current], this.rawData)
            return obj[key]
        }
    }
}