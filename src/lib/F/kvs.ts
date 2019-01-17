import { keys } from 'ramda'

export const kvs = <T extends any>(obj: { [k: string]: T }) =>
    keys(obj).map(k => ({ k: k as keyof T, v: obj[k] }))