import { BitMEXWSAPI } from '../lib/BitMEX/BitMEXWSAPI'
import { createJSONSync } from './____API____'
import { keys } from 'ramda'

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
            if (frame.table === 'margin' && this.ws.data.margin.length > 0) {
                const { walletBalance } = this.ws.data.margin[0]
                const { wallet } = this.jsonSync.rawData
                if (wallet.length === 0 || wallet[wallet.length - 1].total !== walletBalance) {
                    this.jsonSync.data.wallet.____push({
                        time: new Date(this.ws.data.margin[0].timestamp).getTime(),
                        total: walletBalance
                    })
                }
            }
            else if (frame.table === 'position') {
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
                console.log('仓位数量',
                    this.jsonSync.rawData.symbol.XBTUSD.仓位数量,
                    '开仓均价', this.jsonSync.rawData.symbol.XBTUSD.开仓均价
                )
            }
            else if (frame.table === 'order') {

                console.log('委托列表', JSON.stringify(this.ws.data.order.map(v => v.ordStatus), undefined, 4))


                const 只减仓 = this.ws.data.order.filter(v =>
                    v.symbol === 'XBTUSD' &&
                    v.ordType === 'Limit' &&
                    v.execInst === 'ParticipateDoNotInitiate,ReduceOnly' &&
                    v.workingIndicator === true
                ).map(v => ({
                    orderID: v.orderID,
                    side: v.side,
                    price: v.price,
                    orderQty: v.orderQty,
                }))


                const 挂单 = this.ws.data.order.filter(v =>
                    v.symbol === 'XBTUSD' &&
                    v.ordType === 'Limit' &&
                    v.execInst === 'ParticipateDoNotInitiate' &&
                    v.workingIndicator === true
                ).map(v => ({
                    orderID: v.orderID,
                    side: v.side,
                    price: v.price,
                    orderQty: v.orderQty,
                }))


                const 市价止损 = this.ws.data.order.filter(v =>
                    v.symbol === 'XBTUSD' &&
                    v.ordType === 'Stop' &&
                    v.execInst === 'Close,LastPrice' &&
                    v.workingIndicator === true
                ).map(v => ({
                    orderID: v.orderID,
                    side: v.side,
                    stopPx: v.stopPx,
                    orderQty: v.orderQty,
                }))

                console.log('只减仓', JSON.stringify(只减仓, undefined, 4))
                console.log('挂单', JSON.stringify(挂单, undefined, 4))
                console.log('市价止损', JSON.stringify(市价止损, undefined, 4))
            }
        }
    }
}