import { BitMEXWSAPI } from '../lib/BitMEX/BitMEXWSAPI'
import { createJSONSync } from './____API____'
import { keys } from 'ramda'
import { BaseType } from '../lib/BaseType'
import { sleep } from '../lib/C/sleep'
import { BitMEXOrderAPI } from '../lib/BitMEX/BitMEXOrderAPI'
import { realData } from './realData'
import { lastNumber } from '../lib/F/lastNumber'
import { to范围 } from '../lib/F/to范围'


const toGridPoint = (symbol: BaseType.BitmexSymbol, value: number, side: BaseType.Side) => {
    const grid = symbol === 'XBTUSD' ? 0.5 : 0.05

    const ret = Math.floor(value / grid) * grid
    if (side === 'Buy') {       //ret <= value
        return ret
    }
    else {                      //ret>= value
        if (ret === value) {
            return value
        } else {
            return ret + grid
        }
    }
}


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

        keys(this.jsonSync.rawData.symbol).forEach(symbol => {
            this.止损任务(symbol)
        })
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
                type: '限价' | '限价只减仓' | '止损' | '市价触发'
                id: string
                side: BaseType.Side
                size: number
                price: number
            }[]

            this.ws.data.order.filter(v => v.symbol === symbol).forEach(v => {
                if (v.ordType === 'Limit' && v.execInst === 'ParticipateDoNotInitiate' && v.workingIndicator) {
                    arr.push({
                        type: '限价',
                        id: v.orderID,
                        side: v.side as BaseType.Side,
                        size: v.orderQty,
                        price: v.price,
                    })
                }
                else if (v.ordType === 'Limit' && v.execInst === 'ParticipateDoNotInitiate,ReduceOnly' && v.workingIndicator) {
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
                else if (v.ordType === 'MarketIfTouched' && v.execInst === 'LastPrice') {
                    arr.push({
                        type: '市价触发',
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


    async 止损step(symbol: BaseType.BitmexSymbol) {
        const { 仓位数量, 开仓均价 } = this.jsonSync.rawData.symbol[symbol]
        const arr = this.jsonSync.rawData.symbol[symbol].活动委托.filter(v => v.type === '止损')

        //清空止损列表
        if (arr.length > 1 ||   //不能有多个止损
            (仓位数量 === 0 && arr.length === 1) || //没有仓位 不能有止损
            (仓位数量 > 0 && arr.length === 1 && arr[0].side !== 'Sell') || //止损方向错了
            (仓位数量 < 0 && arr.length === 1 && arr[0].side !== 'Buy')  //止损方向错了
        ) {
            await BitMEXOrderAPI.cancel(this.cookie, arr.map(v => v.id))
            return true
        }


        //初始化止损
        else if (仓位数量 !== 0 && arr.length === 0) {

            const 止损点 =
                symbol === 'XBTUSD' ?
                    to范围({ min: 3, max: 18, value: lastNumber(realData.dataExt.XBTUSD.期货.波动率) / 4 }) :
                    to范围({ min: 0.1, max: 0.9, value: lastNumber(realData.dataExt.ETHUSD.期货.波动率) / 100 + 0.1 })

            if (isNaN(止损点)) {
                return false //波动率还没出来 不止损
            }

            const side = 仓位数量 > 0 ? 'Sell' : 'Buy'

            await BitMEXOrderAPI.stop(this.cookie, {
                symbol,
                side,
                price: toGridPoint(symbol, 仓位数量 > 0 ? 开仓均价 - 止损点 : 开仓均价 + 止损点, side),
            })
            return true
        }
        //修改止损  只能改小  不能改大
        else if (仓位数量 !== 0 && arr.length === 1) {
            const { price, side, id } = arr[0]
            const 浮盈点数 = this.get浮盈点数(symbol)
            let 新的Price = NaN

            if (浮盈点数 > 7) {
                新的Price = toGridPoint(symbol, 开仓均价, side)
            }
            else if (浮盈点数 > 15) {
                新的Price = toGridPoint(symbol, 开仓均价 + (side === 'Buy' ? - 3 : 3), side)
            }

            if (isNaN(新的Price)) {
                return false
            }
            else if (
                (side === 'Buy' && 新的Price < price) ||
                (side === 'Sell' && 新的Price > price)
            ) {
                await BitMEXOrderAPI.updateStop(this.cookie, {
                    orderID: id,
                    price: 新的Price,
                })
                return true
            }
        }

        return false
    }


    async 止损任务(symbol: BaseType.BitmexSymbol) {
        while (true) {
            if (this.jsonSync.rawData.symbol[symbol].任务.止损) {
                if (await this.止损step(symbol)) {
                    await sleep(2000) //2s
                }
            }
            await sleep(500)
        }
    }

    get浮盈点数(symbol: BaseType.BitmexSymbol) {
        const 最新价 = realData.期货价格dic.get(symbol)
        if (最新价 === undefined) return NaN
        const { 仓位数量, 开仓均价 } = this.jsonSync.rawData.symbol[symbol]
        if (仓位数量 === 0) return NaN
        if (仓位数量 > 0) {
            return 最新价 - 开仓均价
        } else if (仓位数量 < 0) {
            return 开仓均价 - 最新价
        } else {
            return 0
        }
    }

}
