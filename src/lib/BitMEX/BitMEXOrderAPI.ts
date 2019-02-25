import { BaseType } from '../BaseType'
import { BitMEXRESTAPI } from '../BitMEX/BitMEXRESTAPI'
import { sleep } from '../C/sleep'
import { JSONRequestError } from '../C/JSONRequest'
import { BitMEXWSAPI } from './BitMEXWSAPI'

let callID = 0

export class BitMEXOrderAPI {

    private cookie: string
    private 重试几次: number
    private 重试休息多少毫秒: number
    log = (text: string) => { }

    constructor(p: { cookie: string, 重试几次: number, 重试休息多少毫秒: number }) {
        this.cookie = p.cookie
        this.重试几次 = p.重试几次
        this.重试休息多少毫秒 = p.重试休息多少毫秒
    }

    private DDOS调用 = <P>(f: (cookie: string, p: P) => Promise<{ error?: JSONRequestError, data?: any }>) =>
        async (p: P, logText?: string, ws?: BitMEXWSAPI) => {
            const startTime = Date.now()
            let success = false
            let i = 1
            let errMsg = ''
            const __id__ = callID++

            if (logText !== undefined) {
                this.log(`__${__id__}__` + logText + '\nsend:' + JSON.stringify(p))
            }

            for (i = 1; i <= this.重试几次; i++) {
                const ret = await f(this.cookie, p)

                if (ret.error === '网络错误') {
                    success = false
                    errMsg = JSON.stringify(ret)
                    break
                }
                else if (ret.error === undefined && ret.data !== undefined && ret.data.ordStatus !== 'Canceled' && ret.data.ordStatus !== 'Rejected') {
                    success = true

                    //
                    if (ws !== undefined) {
                        if (ret.data.orderID !== undefined && ret.data.ordStatus !== undefined) {
                            ws.onAction({
                                action: 'insert',
                                table: 'order',
                                data: [ret.data as any],
                            })
                        }
                    }
                    //

                    break
                }
                await sleep(this.重试休息多少毫秒)
                if (i === this.重试几次) errMsg = JSON.stringify(ret)
            }

            if (logText !== undefined) {
                this.log(`__${__id__}__` + `  重试${i}次  ${success ? '成功' : '失败' + errMsg}  耗时:${Date.now() - startTime}ms`)
            }


            return success
        }


    maker = this.DDOS调用<{
        symbol: BaseType.BitmexSymbol
        side: BaseType.Side
        size: number
        price: () => number
        reduceOnly: boolean
        text?: string
    }>(
        (cookie, p) => BitMEXRESTAPI.Order.new(cookie, {
            symbol: p.symbol,
            ordType: 'Limit',
            side: p.side,
            orderQty: p.size,
            price: p.price(),
            execInst: p.reduceOnly ? 'ParticipateDoNotInitiate,ReduceOnly' : 'ParticipateDoNotInitiate',
            text: p.text,
        })
    )

    stop = this.DDOS调用<{
        symbol: BaseType.BitmexSymbol
        side: BaseType.Side
        price: number
        text?: string
    }>(
        (cookie, p) => BitMEXRESTAPI.Order.new(cookie, {
            symbol: p.symbol,
            ordType: 'Stop',
            stopPx: p.price,
            orderQty: 100000,
            side: p.side,
            execInst: 'Close,LastPrice',
            text: p.text,
        })
    )

    updateStop = this.DDOS调用<{
        orderID: string
        price: number
        text?: string
    }>(
        (cookie, p) => BitMEXRESTAPI.Order.amend(cookie, {
            orderID: p.orderID,
            stopPx: p.price,
            text: p.text,
        })
    )

    updateMaker = this.DDOS调用<{
        orderID: string
        price: () => number
        text?: string
    }>(
        (cookie, p) => BitMEXRESTAPI.Order.amend(cookie, {
            orderID: p.orderID,
            price: p.price(),
            text: p.text,
        })
    )

    limit = this.DDOS调用<{
        symbol: BaseType.BitmexSymbol
        side: BaseType.Side
        size: number
        price: () => number
        text?: string
    }>(
        (cookie, p) => BitMEXRESTAPI.Order.new(cookie, {
            symbol: p.symbol,
            ordType: 'Limit',
            side: p.side,
            orderQty: p.size,
            price: p.price() + ((p.side === 'Buy' ? 1 : -1) * (p.symbol === 'XBTUSD' ? 0.5 : 0.05)),
            text: p.text,
        })
    )

    taker = this.DDOS调用<{
        symbol: BaseType.BitmexSymbol
        side: BaseType.Side
        size: number
        text?: string
    }>(
        (cookie, p) => BitMEXRESTAPI.Order.new(cookie, {
            symbol: p.symbol,
            ordType: 'Market',
            side: p.side,
            orderQty: p.size,
            text: p.text,
        })
    )

    close = this.DDOS调用<BaseType.BitmexSymbol>(
        (cookie, symbol) => BitMEXRESTAPI.Order.new(cookie, {
            symbol,
            ordType: 'Market',
            execInst: 'Close',
            text: '市价平仓全部',
        })
    )

    cancel = this.DDOS调用<string[]>(
        (cookie, orderID) => BitMEXRESTAPI.Order.cancel(cookie, { orderID: JSON.stringify(orderID) })
    )
} 