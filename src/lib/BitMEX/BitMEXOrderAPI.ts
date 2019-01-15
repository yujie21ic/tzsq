import { BaseType } from '../BaseType'
import { BitMEXRESTAPI } from '../BitMEX/BitMEXRESTAPI'
import { sleep } from '../C/sleep'

export namespace BitMEXOrderAPI {

    const BitMEXOptions = <A extends string, B extends string>(a: A, b: B) => <A | B>(a + ',' + b)

    const 重试几次 = 10
    const 重试休息多少毫秒 = 10

    export const maker = async (
        cookie: string,
        p: {
            symbol: BaseType.BitmexSymbol
            side: BaseType.Side
            size: number
            price: () => number
        }
    ) => {
        let success = false
        for (let i = 0; i < 重试几次; i++) {
            const ret = await BitMEXRESTAPI.Order.new(cookie, {
                symbol: p.symbol,
                side: p.side,
                orderQty: p.size,
                price: p.price(),
                execInst: 'ParticipateDoNotInitiate'
            })

            if (ret.error === '网络错误') {
                success = false
                break
            }
            else if (ret.error === undefined && ret.data !== undefined && ret.data.ordStatus !== 'Canceled') {
                success = true
                break
            }
            await sleep(重试休息多少毫秒)
        }
        return success
    }

    export const taker = async (
        cookie: string,
        p: {
            symbol: BaseType.BitmexSymbol
            side: BaseType.Side
            size: number
        }
    ) => {
        let success = false
        for (let i = 0; i < 重试几次; i++) {
            const ret = await BitMEXRESTAPI.Order.new(cookie, {
                symbol: p.symbol,
                side: p.side,
                orderQty: p.size,
                ordType: 'Market'
            })

            if (ret.error === '网络错误') {
                success = false
                break
            }
            else if (ret.error === undefined) {
                success = true
                break
            }
            await sleep(重试休息多少毫秒)
        }
        return success
    }


    export const reduceOnly = async (
        cookie: string,
        p: {
            symbol: BaseType.BitmexSymbol
            side: BaseType.Side
            size: number
            price: () => number
        }
    ) => {
        let success = false
        for (let i = 0; i < 重试几次; i++) {
            const ret = await BitMEXRESTAPI.Order.new(cookie,
                {
                    symbol: p.symbol,
                    ordType: 'Limit',
                    price: p.price(),
                    orderQty: p.size,
                    side: p.side,
                    execInst: BitMEXOptions('ParticipateDoNotInitiate', 'ReduceOnly'),
                })

            if (ret.error === '网络错误') {
                success = false
                break
            }
            else if (ret.error === undefined && ret.data !== undefined && ret.data.ordStatus !== 'Canceled') {
                success = true
                break
            }
            await sleep(重试休息多少毫秒)
        }
        return success
    }

    export const close = async (cookie: string, symbol: BaseType.BitmexSymbol) => {
        let success = false
        for (let i = 0; i < 重试几次; i++) {
            const ret = await BitMEXRESTAPI.Order.new(cookie, {
                symbol,
                ordType: 'Market',
                execInst: 'Close'
            })

            if (ret.error === '网络错误') {
                success = false
                break
            }
            else if (ret.error === undefined) {
                success = true
                break
            }
            await sleep(重试休息多少毫秒)
        }
        return success
    }

    export const stop = async (
        cookie: string,
        p: {
            symbol: BaseType.BitmexSymbol
            side: BaseType.Side
            price: () => number
        }
    ) => {
        let success = false
        for (let i = 0; i < 重试几次; i++) {
            const ret = await BitMEXRESTAPI.Order.new(cookie,
                {
                    symbol: p.symbol,
                    ordType: 'Stop',
                    stopPx: p.price(),
                    orderQty: 100000,
                    side: p.side,
                    execInst: BitMEXOptions('Close', 'LastPrice'),
                })

            if (ret.error === '网络错误') {
                success = false
                break
            }
            else if (ret.error === undefined) {
                success = true
                break
            }
            await sleep(重试休息多少毫秒)
        }
        return success
    }

    export const cancelAll = async (cookie: string, symbol: BaseType.BitmexSymbol) => {
        let success = false
        for (let i = 0; i < 重试几次; i++) {
            const ret = await BitMEXRESTAPI.Order.cancelAll(cookie, { symbol })

            if (ret.error === '网络错误') {
                success = false
                break
            }
            else if (ret.error === undefined) {
                success = true
                break
            }
            await sleep(重试休息多少毫秒)
        }
        return success
    }

}