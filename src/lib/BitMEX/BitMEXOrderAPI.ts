import { BaseType } from '../BaseType'
import { BitMEXRESTAPI } from '../BitMEX/BitMEXRESTAPI'
import { sleep } from '../C/sleep'
import { JSONRequestError } from '../C/JSONRequest'

export namespace BitMEXOrderAPI {

    const 重试几次 = 10
    const 重试休息多少毫秒 = 10

    const xx = <P>(f: (cookie: string, p: P) => Promise<{ error?: JSONRequestError }>) => async (cookie: string, p: P) => {
        let success = false
        for (let i = 0; i < 重试几次; i++) {
            const ret = await f(cookie, p)

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

    const xx_ordStatus = <P>(f: (cookie: string, p: P) => Promise<{ error?: JSONRequestError, data?: { ordStatus: string } }>) => async (cookie: string, p: P) => {
        let success = false
        for (let i = 0; i < 重试几次; i++) {
            const ret = await f(cookie, p)
            if (ret.error === '网络错误') {
                success = false
                break
            }
            else if (ret.error === undefined && ret.data !== undefined && ret.data.ordStatus === 'New') {
                success = true
                break
            }
            await sleep(重试休息多少毫秒)
        }
        return success
    }

    //需要判断 ordStatus
    export const maker = xx_ordStatus<{
        symbol: BaseType.BitmexSymbol
        side: BaseType.Side
        size: number
        price: () => number
        reduceOnly: boolean
    }>(
        (cookie, p) => BitMEXRESTAPI.Order.new(cookie, {
            symbol: p.symbol,
            ordType: 'Limit',
            side: p.side,
            orderQty: p.size,
            price: p.price(),
            execInst: p.reduceOnly ? ['ParticipateDoNotInitiate', 'ReduceOnly'] : 'ParticipateDoNotInitiate',
        })
    )

    export const stop = xx_ordStatus<{
        symbol: BaseType.BitmexSymbol
        side: BaseType.Side
        price: number
    }>(
        (cookie, p) => BitMEXRESTAPI.Order.new(cookie, {
            symbol: p.symbol,
            ordType: 'Stop',
            stopPx: p.price,
            orderQty: 100000,
            side: p.side,
            execInst: ['Close', 'LastPrice'],
        })
    )

    export const 市价触发 = xx_ordStatus<{
        symbol: BaseType.BitmexSymbol
        side: BaseType.Side
        price: number
        size: number
    }>(
        (cookie, p) => BitMEXRESTAPI.Order.new(cookie, {
            symbol: p.symbol,
            ordType: 'MarketIfTouched',
            stopPx: p.price,
            orderQty: p.size,
            side: p.side,
            execInst: 'LastPrice',
        })
    )

    export const updateStop = xx_ordStatus<{
        orderID: string
        price: number
    }>(
        (cookie, p) => BitMEXRESTAPI.Order.amend(cookie, {
            orderID: p.orderID,
            stopPx: p.price,
        })
    )

    export const updateMaker = xx_ordStatus<{
        orderID: string
        price: () => number
    }>(
        (cookie, p) => BitMEXRESTAPI.Order.amend(cookie, {
            orderID: p.orderID,
            price: p.price(),
        })
    )

    export const taker = xx<{
        symbol: BaseType.BitmexSymbol
        side: BaseType.Side
        size: number
    }>(
        (cookie, p) => BitMEXRESTAPI.Order.new(cookie, {
            symbol: p.symbol,
            ordType: 'Market',
            side: p.side,
            orderQty: p.size,
        })
    )

    export const close = xx<BaseType.BitmexSymbol>(
        (cookie, symbol) => BitMEXRESTAPI.Order.new(cookie, {
            symbol,
            ordType: 'Market',
            execInst: 'Close',
        })
    )

    export const cancel = xx<string[]>(
        (cookie, orderID) => BitMEXRESTAPI.Order.cancel(cookie, { orderID: JSON.stringify(orderID) })
    )
} 