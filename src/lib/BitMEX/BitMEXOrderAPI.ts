import { BaseType } from '../BaseType'
import { BitMEXRESTAPI } from '../BitMEX/BitMEXRESTAPI'
import { sleep } from '../C/sleep'
import { JSONRequestError } from '../C/JSONRequest'

import * as fs from 'fs'

export const BitMEXOrderAPI__logToFile = (path: string, text: string) =>
    fs.writeFileSync(path, text + '  \n', { flag: 'a' })


export class BitMEXOrderAPI {

    private cookie: string
    private 重试几次: number
    private 重试休息多少毫秒: number

    constructor(p: { cookie: string, 重试几次: number, 重试休息多少毫秒: number }) {
        this.cookie = p.cookie
        this.重试几次 = p.重试几次
        this.重试休息多少毫秒 = p.重试休息多少毫秒
    }

    DDOS调用 = <P>(f: (cookie: string, p: P) => Promise<{ error?: JSONRequestError }>) =>
        async (p: P, log?: { path: string, text: string }) => {
            const startTime = Date.now()
            let success = false
            let i = 1

            if (log !== undefined) {
                BitMEXOrderAPI__logToFile(log.path, '\n\n___________________________________________')
                BitMEXOrderAPI__logToFile(log.path, new Date(startTime).toLocaleString() + log.text)
                BitMEXOrderAPI__logToFile(log.path, JSON.stringify(p, undefined, 4))
            }

            for (let i = 1; i <= this.重试几次; i++) {
                const ret = await f(this.cookie, p)

                if (ret.error === '网络错误') {
                    success = false
                    break
                }
                else if (ret.error === undefined) {
                    success = true
                    break
                }
                await sleep(this.重试休息多少毫秒)
            }

            if (log !== undefined) {
                BitMEXOrderAPI__logToFile(log.path, new Date().toLocaleString() + log.text + `  重试${i}次  ${success ? '成功' : '失败'}  耗时:${Date.now() - startTime}ms`)
                BitMEXOrderAPI__logToFile(log.path, '___________________________________________\n\n')
            }

            return success
        }


    DDOS调用_ordStatus = <P>(f: (cookie: string, p: P) => Promise<{ error?: JSONRequestError, data?: { ordStatus: string } }>) =>
        async (p: P, log?: { path: string, text: string }) => {
            const startTime = Date.now()
            let success = false
            let i = 1

            if (log !== undefined) {
                BitMEXOrderAPI__logToFile(log.path, '\n\n___________________________________________')
                BitMEXOrderAPI__logToFile(log.path, new Date(startTime).toLocaleString() + log.text)
                BitMEXOrderAPI__logToFile(log.path, JSON.stringify(p, undefined, 4))
            }

            for (let i = 1; i <= this.重试几次; i++) {
                const ret = await f(this.cookie, p)

                if (ret.error === '网络错误') {
                    success = false
                    break
                }
                else if (ret.error === undefined && ret.data !== undefined && ret.data.ordStatus === 'New') {
                    success = true
                    break
                }
                await sleep(this.重试休息多少毫秒)
            }

            if (log !== undefined) {
                BitMEXOrderAPI__logToFile(log.path, new Date().toLocaleString() + log.text + `  重试${i}次  ${success ? '成功' : '失败'}  耗时:${Date.now() - startTime}ms`)
                BitMEXOrderAPI__logToFile(log.path, '___________________________________________\n\n')
            }

            return success
        }


    //需要判断 ordStatus
    maker = this.DDOS调用_ordStatus<{
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

    limit = this.DDOS调用<{
        symbol: BaseType.BitmexSymbol
        side: BaseType.Side
        size: number
        price: () => number
    }>(
        (cookie, p) => BitMEXRESTAPI.Order.new(cookie, {
            symbol: p.symbol,
            ordType: 'Limit',
            side: p.side,
            orderQty: p.size,
            price: p.price() + ((p.side === 'Buy' ? 1 : -1) * (p.symbol === 'XBTUSD' ? 0.5 : 0.05)),
        })
    )

    stop = this.DDOS调用_ordStatus<{
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

    市价触发 = this.DDOS调用_ordStatus<{
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

    updateStop = this.DDOS调用_ordStatus<{
        orderID: string
        price: number
    }>(
        (cookie, p) => BitMEXRESTAPI.Order.amend(cookie, {
            orderID: p.orderID,
            stopPx: p.price,
        })
    )

    updateMaker = this.DDOS调用_ordStatus<{
        orderID: string
        price: () => number
    }>(
        (cookie, p) => BitMEXRESTAPI.Order.amend(cookie, {
            orderID: p.orderID,
            price: p.price(),
        })
    )

    taker = this.DDOS调用<{
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

    close = this.DDOS调用<BaseType.BitmexSymbol>(
        (cookie, symbol) => BitMEXRESTAPI.Order.new(cookie, {
            symbol,
            ordType: 'Market',
            execInst: 'Close',
        })
    )

    cancel = this.DDOS调用<string[]>(
        (cookie, orderID) => BitMEXRESTAPI.Order.cancel(cookie, { orderID: JSON.stringify(orderID) })
    )
} 