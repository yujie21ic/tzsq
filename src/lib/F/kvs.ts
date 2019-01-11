//keys
//values

export const kvs = <T extends any>(obj: { [k: string]: T }) =>
    Object.keys(obj).map(k => ({ k, v: obj[k] }))