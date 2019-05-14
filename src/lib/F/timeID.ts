export namespace timeID {

    const f = (ms: number) => ({
        toID: (timestamp: number) => Math.floor(timestamp / ms),
        toTimestamp: (id: number) => id * ms, //>=id  <id+1
    })

    export const _500ms = f(500)
    export const _1s = f(1000)
    export const _12s = f(1000 * 12)
    export const _60s = f(1000 * 60)
}