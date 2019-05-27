import * as R from 'ramda'

export const mapObjIndexed = R.mapObjIndexed as {
    <In, Out, T>(
        f: (value: In, key: keyof T, obj: T) => Out,
        obj: T & { [key: string]: In }
    ): { [K in keyof T]: Out }

    <In, Out, T>(
        f: (value: In, key: keyof T, obj: T) => Out
    ): (obj: T & { [key: string]: In }) => { [K in keyof T]: Out }
} 