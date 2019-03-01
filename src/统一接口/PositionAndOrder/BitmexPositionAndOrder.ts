import { BitMEXWSAPI } from '../BitMEX/BitMEXWSAPI'
import { BitMEXOrderAPI } from '../BitMEX/BitMEXOrderAPI'
import { logToFile } from '../../lib/C/logToFile'
import { BaseType } from '../../lib/BaseType'
import { JSONSync } from '../../lib/C/JSONSync'
import { keys } from 'ramda'

const symbol = () => ({
    任务开关: {
        自动开仓摸顶: {
            value: false,
            text: '',
        },
        自动开仓抄底: {
            value: false,
            text: '',
        },
        自动开仓追涨: {
            value: false,
            text: '',
        },
        自动开仓追跌: {
            value: false,
            text: '',
        },
        自动止盈: {
            value: false,
            text: '',
        },
        自动止盈波段: {
            value: false,
            text: '',
        },
        自动推止损: {
            value: true,
            text: '',
        }
    },

    委托: {
        id: '',
        side: '' as BaseType.Side,
        cumQty: 0,      //成交数量
        orderQty: 0,    //委托数量
        price: 0,
    },
    止损价格: 0,
    仓位数量: 0,
    开仓均价: 0,
})

export const createJSONSync = () =>
    new JSONSync({
        symbol: {
            XBTUSD: symbol(),
            ETHUSD: symbol(),
        }
    })

type Order = {
    type: '限价' | '限价只减仓' | '止损'
    timestamp: number
    id: string
    side: BaseType.Side
    cumQty: number      //成交数量
    orderQty: number    //委托数量
    price: number
}

export class BitmexPositionAndOrder {

    accountName: string
    cookie: string
    jsonSync = createJSONSync()
    活动委托 = {
        XBTUSD: [] as Order[],
        ETHUSD: [] as Order[],
    }


    //
    ws: BitMEXWSAPI
    bitMEXOrderAPI: BitMEXOrderAPI

    constructor(p: { accountName: string, cookie: string }) {
        this.accountName = p.accountName
        this.cookie = p.cookie


        this.bitMEXOrderAPI = new BitMEXOrderAPI({
            cookie: p.cookie,
            重试几次: 10,
            重试休息多少毫秒: 10,
        })
        this.bitMEXOrderAPI.log = logToFile(this.accountName + '.txt')


        this.ws = new BitMEXWSAPI(p.cookie, [
            { theme: 'margin' },
            { theme: 'position' },
            { theme: 'order' },
        ])
        this.ws.增量同步数据.log = logToFile(this.accountName + '.txt')

        this.ws.onmessage = frame => {

            if (frame.table === 'position') {
                this.updatePosition()
            }
            else if (frame.table === 'order') {
                this.updateOrder()
            }
        }

    }

    private updatePosition() {
        keys(this.jsonSync.rawData.symbol).forEach(symbol => {
            this.ws.data.position.forEach(item => {
                if (item.symbol === symbol) {
                    const { 仓位数量, 开仓均价 } = this.jsonSync.data.symbol[symbol]
                    const raw = this.jsonSync.rawData.symbol[symbol]
                    if (item !== undefined) {
                        if (raw.仓位数量 !== item.currentQty || raw.开仓均价 !== item.avgCostPrice) {
                            仓位数量.____set(item.currentQty)
                            开仓均价.____set(item.avgCostPrice)
                            this.bitMEXOrderAPI.log(`仓位更新: ${symbol} 仓位数量:${item.currentQty}  本地维护仓位数量:${this.ws.增量同步数据.仓位数量.get(symbol)}  开仓均价:${item.avgCostPrice}`)
                        }
                    } else {
                        if (raw.仓位数量 !== 0 || raw.开仓均价 !== 0) {
                            仓位数量.____set(0)
                            开仓均价.____set(0)
                            this.bitMEXOrderAPI.log(`仓位更新: ${symbol} 仓位数量:0  本地维护仓位数量:${this.ws.增量同步数据.仓位数量.get(symbol)}`)
                        }
                    }
                }
            })

        })
    }

    private updateOrder() {

        keys(this.jsonSync.rawData.symbol).forEach(symbol => {

            const arr = [] as {
                type: '限价' | '限价只减仓' | '止损'
                timestamp: number
                id: string
                side: BaseType.Side
                cumQty: number
                orderQty: number
                price: number
            }[]

            this.ws.data.order.forEach(v => {
                if (v.symbol === symbol) {
                    if (v.ordType === 'Limit' && v.execInst === 'ParticipateDoNotInitiate,ReduceOnly' && v.workingIndicator) {//先检测只减仓
                        arr.push({
                            type: '限价只减仓',
                            timestamp: new Date(v.timestamp).getTime(),
                            id: v.orderID,
                            side: v.side as BaseType.Side,
                            cumQty: v.cumQty,
                            orderQty: v.orderQty,
                            price: v.price,
                        })
                    }
                    else if (v.ordType === 'Limit' /*&& v.execInst === 'ParticipateDoNotInitiate'*/ && v.workingIndicator) { //不勾被动委托也行
                        arr.push({
                            type: '限价',
                            timestamp: new Date(v.timestamp).getTime(),
                            id: v.orderID,
                            side: v.side as BaseType.Side,
                            cumQty: v.cumQty,
                            orderQty: v.orderQty,
                            price: v.price,
                        })
                    }
                    else if (v.ordType === 'Stop' && v.execInst === 'Close,LastPrice') {
                        arr.push({
                            type: '止损',
                            timestamp: new Date(v.timestamp).getTime(),
                            id: v.orderID,
                            side: v.side as BaseType.Side,
                            cumQty: v.cumQty,
                            orderQty: v.orderQty,
                            price: v.stopPx,
                        })
                    }
                }
            })


            this.活动委托[symbol] = arr

            const x = this.活动委托[symbol].find(v => v.type !== '止损')
            if (x === undefined) {
                this.jsonSync.data.symbol[symbol].委托.id.____set('')
            } else {
                this.jsonSync.data.symbol[symbol].委托.cumQty.____set(x.cumQty)
                this.jsonSync.data.symbol[symbol].委托.id.____set(x.id)
                this.jsonSync.data.symbol[symbol].委托.orderQty.____set(x.orderQty)
                this.jsonSync.data.symbol[symbol].委托.price.____set(x.price)
                this.jsonSync.data.symbol[symbol].委托.side.____set(x.side)
            }

            const y = this.活动委托[symbol].find(v => v.type === '止损')
            if (y === undefined) {
                this.jsonSync.data.symbol[symbol].止损价格.____set(0)
            } else {
                this.jsonSync.data.symbol[symbol].止损价格.____set(y.price)
            }
        })
    }

}