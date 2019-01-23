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
                    this.set({ path: [...path, '__push__'], value })
                },
                ____updateLast: (value: any) => {
                    this.set({ path: [...path, '__last__'], value })
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

    private setObjKV(obj: any, k: string | number, v: any) {
        if (k === '__push__') {
            obj.push(v)
        }
        else if (k === '__last__') {
            obj[obj.length - 1] = v
        }
        else {
            obj[k] = v
        }
    }

    set({ path, value }: OP) {
        if (path.length === 0) {
            this.rawData = value
        }
        else {
            const key = path[path.length - 1]
            const obj = path.reduce((prev: any, current, i) => i === path.length - 1 ? prev : prev[current], this.rawData)
            this.setObjKV(obj, key, value)
        }
        this.subject.next({ path, value })
    }

    private get(path: PATH) {
        if (path.length === 0) {
            return this.rawData
        }
        else {
            const key = path[path.length - 1]
            const obj = path.reduce((prev: any, current, i) => i === path.length - 1 ? prev : prev[current], this.rawData)
            return obj[key]
        }
    }
}