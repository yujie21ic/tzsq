export namespace timeID {

    export const timestampToOneMinuteID = (timestamp: number) =>
        Math.floor(timestamp / 1000 / 60)

    export const timestampTo500msID = (timestamp: number) =>
        Math.floor(timestamp / 500)


    export const oneMinuteIDToTimestamp = (id: number) =>
        id * 1000 * 60

    export const _500msIDToTimestamp = (id: number) =>
        id * 500



    //id对应的时间段
    export const oneMinuteIDToTimestampRange = (id: number) => ({
        大于等于: oneMinuteIDToTimestamp(id),
        小于: oneMinuteIDToTimestamp(id + 1),
    })

    export const _500msIDToTimestampRange = (id: number) => ({
        大于等于: _500msIDToTimestamp(id),
        小于: _500msIDToTimestamp(id + 1),
    })

}