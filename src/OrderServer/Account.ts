import { BitMEXWSAPI } from '../lib/BitMEX/BitMEXWSAPI'
import { createJSONSync } from './____API____'
import { keys } from 'ramda'
import { BaseType } from '../lib/BaseType'

export class Account {
    jsonSync = createJSONSync()
    private ws: BitMEXWSAPI
    // private cookie: string
    // private accountName: string

    constructor(p: { accountName: string, cookie: string }) {
        // this.accountName = p.accountName
        // this.cookie = p.cookie

        this.ws = new BitMEXWSAPI(p.cookie, [
            { theme: 'margin' },
            { theme: 'position' },
            { theme: 'order' },
        ])
        this.ws.onmessage = frame => {
            if (frame.table === 'margin') {
                this.updateMargin()
            }
            else if (frame.table === 'position') {
                this.updatePosition()
            }
            else if (frame.table === 'order') {
                this.updateOrder()
            }
        }
    }

    private updateMargin() {
        if (this.ws.data.margin.length > 0) {
            const { walletBalance } = this.ws.data.margin[0]
            const { wallet } = this.jsonSync.rawData
            if (wallet.length === 0 || wallet[wallet.length - 1].total !== walletBalance) {
                this.jsonSync.data.wallet.____push({
                    time: new Date(this.ws.data.margin[0].timestamp).getTime(),
                    total: walletBalance
                })
            }
        }
    }

    private updatePosition() {
        keys(this.jsonSync.rawData.symbol).forEach(symbol => {
            const item = this.ws.data.position.find(v => v.symbol === symbol && v.isOpen)
            const { 仓位数量, 开仓均价 } = this.jsonSync.data.symbol[symbol]
            if (item !== undefined) {
                仓位数量.____set(item.currentQty)
                开仓均价.____set(item.avgCostPrice)
            } else {
                仓位数量.____set(0)
                开仓均价.____set(0)
            }
        })
    }

    private updateOrder() {
        keys(this.jsonSync.rawData.symbol).forEach(symbol => {

            const arr = [] as {
                type: '限价' | '限价只减仓' | '止损'
                id: string
                side: BaseType.Side
                size: number
                price: number
            }[]

            this.ws.data.order.filter(v => v.symbol === symbol && v.workingIndicator).forEach(v => {
                if (v.ordType === 'Limit' && v.execInst === 'ParticipateDoNotInitiate') {
                    arr.push({
                        type: '限价',
                        id: v.orderID,
                        side: v.side as BaseType.Side,
                        size: v.orderQty,
                        price: v.price,
                    })
                }
                else if (v.ordType === 'Limit' && v.execInst === 'ParticipateDoNotInitiate,ReduceOnly') {
                    arr.push({
                        type: '限价只减仓',
                        id: v.orderID,
                        side: v.side as BaseType.Side,
                        size: v.orderQty,
                        price: v.price,
                    })
                }
                else if (v.ordType === 'Stop' && v.execInst === 'Close,LastPrice') {
                    arr.push({
                        type: '止损',
                        id: v.orderID,
                        side: v.side as BaseType.Side,
                        size: v.orderQty,
                        price: v.stopPx,
                    })
                }
            })

            this.jsonSync.data.symbol[symbol].活动委托.____set(arr)
        })
    }




    // 止盈
    // 大于5点，走平止盈一半   ( 平到 只剩 5000)           //  5000设置参数
    // 止损
    // 下单之后的止损，波动率/4，最高18
    // 推止损
    // 下单之后，盈利超过7点，推到成本价，超过15点，推到成本价+3

}