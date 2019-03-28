export namespace timeID {

    export const timestampToOneMinuteID = (timestamp: number) =>
        Math.floor(timestamp / 1000 / 60)

    export const timestampTo500msID = (timestamp: number) =>
        Math.floor(timestamp / 500)


    export const oneMinuteIDToTimestamp = (ID: number) =>
        ID * 1000 * 60

    export const _500msIDToTimestamp = (ID: number) =>
        ID * 500



    //ID对应的时间段
    export const oneMinuteIDToTimestampRange = (ID: number) => ({
        大于等于: oneMinuteIDToTimestamp(ID),
        小于: oneMinuteIDToTimestamp(ID + 1),
    })

    export const _500msIDToTimestampRange = (ID: number) => ({
        大于等于: _500msIDToTimestamp(ID),
        小于: _500msIDToTimestamp(ID + 1),
    })

}