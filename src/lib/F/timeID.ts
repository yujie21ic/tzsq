export namespace timeID {

    export const timestampToOneMinuteID = (time: number) =>
        Math.floor(time / 1000 / 60)

    export const timestampTo500msID = (time: number) =>
        Math.floor(time / 500)


    export const oneMinuteIDToTimestamp = (index: number) =>
        index * 1000 * 60

    export const _500msIDToTimestamp = (index: number) =>
        index * 500



    //注释
    export const oneMinuteIDToTimestampRange = (index: number) => ({
        大于等于: oneMinuteIDToTimestamp(index),
        小于: oneMinuteIDToTimestamp(index + 1),
    })

    export const _500msIDToTimestampRange = (index: number) => ({
        大于等于: _500msIDToTimestamp(index),
        小于: _500msIDToTimestamp(index + 1),
    })

}