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

            this.jsonSync.data.symbol[symbol].限价委托.____set(
                this.ws.data.order.filter(v =>
                    v.symbol === symbol &&
                    v.ordType === 'Limit' &&
                    v.execInst === 'ParticipateDoNotInitiate' &&
                    v.workingIndicator === true
                ).map(v => ({
                    id: v.orderID,
                    side: v.side as BaseType.Side,
                    size: v.orderQty,
                    price: v.price,
                }))
            )

            this.jsonSync.data.symbol[symbol].止盈委托.____set(this.ws.data.order.filter(v =>
                v.symbol === symbol &&
                v.ordType === 'Limit' &&
                v.execInst === 'ParticipateDoNotInitiate,ReduceOnly' &&
                v.workingIndicator === true
            ).map(v => ({
                id: v.orderID,
                side: v.side as BaseType.Side,
                size: v.orderQty,
                price: v.price,
            })))

            this.jsonSync.data.symbol[symbol].止损委托.____set(this.ws.data.order.filter(v =>
                v.symbol === symbol &&
                v.ordType === 'Stop' &&
                v.execInst === 'Close,LastPrice' &&
                v.workingIndicator === true
            ).map(v => ({
                id: v.orderID,
                side: v.side as BaseType.Side,
                size: v.orderQty,
                price: v.stopPx,
            })))
        })
    }


}