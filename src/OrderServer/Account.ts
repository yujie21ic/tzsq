import { BitMEXWSAPI } from '../lib/BitMEX/BitMEXWSAPI'
import { createJSONSync } from './____API____'
import { keys } from 'ramda'
import { BaseType } from '../lib/BaseType'
import { sleep } from '../lib/C/sleep'
import { BitMEXOrderAPI } from '../lib/BitMEX/BitMEXOrderAPI'
import { realData } from './realData'
import { lastNumber } from '../lib/F/lastNumber'


const toXBTUSDGridPoint = (n: number) => Math.floor(n / 0.5) * 0.5

export class Account {
    jsonSync = createJSONSync()
    private ws: BitMEXWSAPI
    // private accountName: string
    private cookie: string

    constructor(p: { accountName: string, cookie: string }) {
        // this.accountName = p.accountName
        this.cookie = p.cookie

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
        this.XBTUSD止损任务()
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


    async XBTUSD止损step() {
        const { 仓位数量, 开仓均价 } = this.jsonSync.rawData.symbol.XBTUSD
        const arr = this.jsonSync.rawData.symbol.XBTUSD.活动委托.filter(v => v.type === '止损')

        //清空止损列表
        if (arr.length > 1 || (仓位数量 === 0 && arr.length !== 0)) {
            await BitMEXOrderAPI.cancel(this.cookie, arr.map(v => v.id))
            return true
        }
        //初始化止损
        else if (仓位数量 !== 0 && arr.length === 0) {
            let 止损点 = lastNumber(realData.dataExt.XBTUSD.期货.波动率) / 4
            if (isNaN(止损点)) {
                return false //波动率还没出来 不止损
            }
            止损点 = Math.max(3, 止损点)
            止损点 = Math.min(18, 止损点)
            await BitMEXOrderAPI.stop(this.cookie, {
                symbol: 'XBTUSD',
                side: 仓位数量 > 0 ? 'Sell' : 'Buy',
                stopPx: toXBTUSDGridPoint(仓位数量 > 0 ? 开仓均价 - 止损点 : 开仓均价 + 止损点),
            })
            return true
        }
        //修改止损  只能改小  不能改大
        else if (仓位数量 !== 0 && arr.length === 1) {
            // 盈利超过7点    止损 = 成本价，
            // 盈利超过15点   止损 =  成本价 + 3
            return true
        }


        return false
    }


    async XBTUSD止损任务() {
        while (true) {
            if (this.jsonSync.rawData.symbol.XBTUSD.任务.止损) {
                if (await this.XBTUSD止损step()) {
                    await sleep(2000) //2s
                }
            }
            await sleep(500)
        }
    }


}
