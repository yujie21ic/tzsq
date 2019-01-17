export namespace timeID {

    export const timestampToOneMinuteID = (time: number) =>
        Math.floor(time / 1000 / 60)

    export const timestampTo500msID = (time: number) =>
        Math.floor(time / 500)


    export const oneMinuteIDToTimestamp = (index: number) =>
        index * 1000 * 60

    export const _500msIDToTimestamp = (index: number) =>
        index * 500

}