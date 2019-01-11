import { BitMEXWSAPI } from '../lib/BitMEX/BitMEXWSAPI'
import { BaseType } from '../lib/BaseType'
import { lastNumber } from '../lib/F/lastNumber'
import * as fs from 'fs'
import { sleep } from '../lib/C/sleep'
import { AccountBase } from './AccountBase'
import { BitMEXOrderAPI } from '../lib/BitMEX/BitMEXOrderAPI'
import { RealData } from '../RealDataServer/RealData'


export const realData = new RealData(false)

export const 下单和止损 = async (
    cookie: string,
    p: {
        symbol: BaseType.BitmexSymbol
        side: BaseType.Side
        size: number
        type: 'taker' | 'maker'
        止损点: number
    }
) => {
    if (
        p.type === 'taker' ?
            await BitMEXOrderAPI.taker(cookie, p) :
            await BitMEXOrderAPI.maker(cookie, {
                symbol: p.symbol,
                side: p.side,
                size: p.size,
                price: () => realData.getOrderPrice(p.symbol, p.side, p.type)
            })
    ) {
        const nowPrice = () => realData.getOrderPrice(p.symbol, p.side, p.type)

        const side = p.side === 'Buy' ? 'Sell' : 'Buy'

        let 止损点 = p.止损点

        const item = realData.dataExt[p.symbol as 'XBTUSD']

        if (止损点 === 0 && item !== undefined) {
            止损点 = Math.max(lastNumber(item.期货.波动率) / 15, 3)
            const gridPoint = p.symbol === 'ETHUSD' ? 0.05 : 0.5
            止损点 = Math.floor(止损点 / gridPoint) * gridPoint
        }

        return await BitMEXOrderAPI.stop(cookie, {
            symbol: p.symbol,
            side,
            price: () => nowPrice() + 止损点 * (side === 'Buy' ? 1 : -1),
        })
    }
    return false
}


const 只减仓 = async (
    cookie: string,
    p: {
        symbol: BaseType.BitmexSymbol
        side: BaseType.Side
        size: number
    }
) => await BitMEXOrderAPI.reduceOnly(cookie, {
    ...p,
    price: () => realData.getOrderPrice(p.symbol, p.side, 'maker')
})

const 走平 = <T extends string>(getPrice: (symbol: T) => number) => (p: {
    symbol: T
    side: BaseType.Side
    超时秒: number
    走平秒: number
    偏移: number
}) => new Promise<boolean>(resolve => {

    let 新高低 = getPrice(p.symbol)

    if (isNaN(新高低)) {
        resolve(false) //查找价格失败
        return
    }

    let hasResolve = false

    //超时失败
    setTimeout(() => {
        if (hasResolve === false) {
            hasResolve = true
            token.unsubscribe()
            resolve(false)
        }
    }, p.超时秒 * 1000)

    let ms计时: any
    const 走平计时 = () => {
        clearTimeout(ms计时)
        ms计时 = setTimeout(() => {
            //成功了
            if (hasResolve === false) {
                hasResolve = true
                token.unsubscribe()
                resolve(true)
            }
        }, p.走平秒 * 1000)
    }

    走平计时() //初始计时

    const token = realData.priceObservable.subscribe(v => {
        if (v.symbol === p.symbol) {
            if ((p.side === 'Buy' && v.price < 新高低 - p.偏移) || (p.side === 'Sell' && v.price > 新高低 + p.偏移)) {
                新高低 = v.price
                走平计时()
            }
        }
    })
})

const 现货走平X = 走平<BaseType.BinanceSymbol>(symbol => {
    const n = realData.现货价格dic.get(symbol)
    return n === undefined ? NaN : n
})

const 期货走平X = 走平<BaseType.BitmexSymbol>(symbol => {
    const n = realData.期货价格dic.get(symbol)
    return n === undefined ? NaN : n
})






const get止损成本价 = (p: { side: BaseType.Side, price: number, gridPoint: number }) => {
    if (p.side === 'Buy') {
        const ret = Math.floor(p.price / p.gridPoint) * p.gridPoint
        if (ret === p.price) {
            return ret - p.gridPoint
        } else {
            return ret
        }
    } else {
        const ret = Math.floor(p.price / p.gridPoint + 1) * p.gridPoint
        if (ret === p.price) {
            return ret + p.gridPoint
        } else {
            return ret
        }
    }
}



let IDCounter = 0

export class Account extends AccountBase {
    private ws: BitMEXWSAPI
    private cookie: string
    ID = '' + (IDCounter++)

    constructor(cookie: string) {
        super()
        this.cookie = cookie
        this.ws = new BitMEXWSAPI(cookie, [
            { theme: 'order' },
            { theme: 'position' },
            { theme: 'margin' }
        ])
        this.ws.onmessage = frame => {
            if (frame.table === 'margin' && this.ws.data.margin.length > 0) {
                //总: walletBalance,
                //可用: availableMargin
                const 总 = this.ws.data.margin[0].walletBalance
                const { wallet } = this.jsonSync.rawData

                if (wallet.length === 0) {
                    this.jsonSync.data.wallet.____push({
                        time: new Date(this.ws.data.margin[0].timestamp).getTime(),
                        total: 总
                    })
                } else {
                    if (wallet[wallet.length - 1].total !== 总) {
                        this.jsonSync.data.wallet.____push({
                            time: new Date(this.ws.data.margin[0].timestamp).getTime(),
                            total: 总
                        })
                    }
                }
            }
        }
    }


    有委托(symbol: BaseType.BitmexSymbol) {
        return this.ws.data.order.some(v => v.symbol === symbol)
    }

    get当前止损价格(symbol: BaseType.BitmexSymbol) {
        const item = this.ws.data.order.find(v => v.symbol === symbol && v.ordType === 'Stop')
        if (item === undefined) {
            return NaN
        } else {
            return item.stopPx
        }
    }

    get仓位(symbol: BaseType.BitmexSymbol) {
        const item = this.ws.data.position.find(v => v.symbol === symbol && v.isOpen)
        if (item === undefined) return undefined

        return {
            仓位数量: item.currentQty,
            开仓均价: item.avgCostPrice
        }
    }

    get止损side(symbol: BaseType.BitmexSymbol) {
        const p = this.get仓位(symbol)
        return (p && p.仓位数量 > 0) ? 'Sell' : 'Buy'
    }

    get止损成本价(symbol: BaseType.BitmexSymbol) {
        const item = this.get仓位(symbol)
        if (item === undefined) return NaN

        const { 仓位数量, 开仓均价 } = item

        return get止损成本价({
            side: 仓位数量 > 0 ? 'Sell' : 'Buy',
            price: 开仓均价,
            gridPoint: symbol === 'ETHUSD' ? 0.05 : 0.5
        })
    }

    get浮盈点数(symbol: BaseType.BitmexSymbol) {
        const 最新价 = realData.期货价格dic.get(symbol)
        if (最新价 === undefined) return NaN

        const item = this.get仓位(symbol)
        if (item === undefined) return NaN

        const { 仓位数量, 开仓均价 } = item

        if (仓位数量 > 0) {
            return 最新价 - 开仓均价
        } else if (仓位数量 < 0) {
            return 开仓均价 - 最新价
        } else {
            return 0
        }
    }


    async 开仓回合(req: {
        type: 'taker' | 'maker',
        side: BaseType.Side,
        size: number,
        止损点: number,
        现货: {
            symbol: BaseType.BinanceSymbol
            超时秒: number
            偏移: number
        },
        期货: {
            symbol: BaseType.BitmexSymbol
            超时秒: number
            偏移: number
        }
    }) {
        const symbol = req.期货.symbol as 'XBTUSD'

        if (this.ws.isConnected === false) return 'ws断开了'
        if (this.有委托(req.期货.symbol)) return '有委托了'
        if (this.get仓位(req.期货.symbol) !== undefined) return '有仓位了'


        const 下单 = async () => await 下单和止损(this.cookie, {
            symbol: req.期货.symbol,
            side: req.side,
            size: req.size,
            type: req.type,
            止损点: req.止损点,
        })

        const xxx = realData.dataExt[symbol]
        if (xxx === undefined) {
            return '波动率获取失败'
        }
        const 延迟下单时间 = Math.max(lastNumber(xxx.期货.波动率) / 15, 1)


        const 现货走平 = async () => await 现货走平X({
            ...req.现货,
            走平秒: 延迟下单时间,
            side: req.side,
        })

        const 期货走平 = async () => await 期货走平X({
            ...req.期货,
            走平秒: 延迟下单时间,
            side: req.side,
        })


        if (this.jsonSync.rawData.symbol[symbol] === undefined) {
            return '找不到 symbol'
        }

        //        
        const log = (msg: string) => {
            this.jsonSync.data.symbol[symbol].msg.____set(msg)
            fs.writeFileSync(`./db/${this.ID}_${req.期货.symbol}_开仓回合.txt`, new Date().toLocaleString() + '  ' + msg + '\n', {
                encoding: 'utf-8',
                flag: 'a+'
            })
            return msg
        }

        if (this.jsonSync.rawData.symbol[symbol].状态 !== '--') {
            return '不是 -- '
        }
        this.jsonSync.data.symbol[symbol].状态.____set('开仓中')

        log(`判断现货走平`)
        if (await 现货走平() === false) {
            this.jsonSync.data.symbol[symbol].状态.____set('--')
            return log(`现货走平超时`)
        }
        log(`现货走平了`)


        const 时间点A价差 = (realData.现货价格dic.get(req.现货.symbol) || NaN) - (realData.期货价格dic.get(req.期货.symbol) || NaN)
        log(`时间点A价差 = ${时间点A价差}`)


        log(`现货走平后__下单`)
        if (await 下单() === false) {
            this.jsonSync.data.symbol[symbol].状态.____set('--')
            return log(`现货走平后__下单失败`)
        }
        log(`现货走平后__下单成功`)


        log(`判断期货走平`)
        if (await 期货走平()) {
            this.jsonSync.data.symbol[symbol].状态.____set('--')
            return log(`期货走平超时`)
        }
        log(`期货走平了`)


        const 时间点B价差 = (realData.现货价格dic.get(req.现货.symbol) || NaN) - (realData.期货价格dic.get(req.期货.symbol) || NaN)
        log(`时间点B价差 = ${时间点B价差}`)


        //没有委托 没有仓位 
        const 期货走平后__下单条件 =
            this.有委托(req.期货.symbol) === false && this.get仓位(req.期货.symbol) === undefined &&
            ((时间点B价差 > 时间点A价差 && req.side === 'Buy') || (时间点B价差 < 时间点A价差 && req.side === 'Sell'))


        if (期货走平后__下单条件 === false) {
            this.jsonSync.data.symbol[symbol].状态.____set('--')
            return log(`期货走平后__不需要下单`)
        }

        log(`期货走平后__下单`)
        if (await 下单() === false) {
            this.jsonSync.data.symbol[symbol].状态.____set('--')
            return log(`期货走平后__下单失败`)
        } else {
            this.jsonSync.data.symbol[symbol].状态.____set('--')
            return log(`期货走平后__下单成功`) //<------------
        }
    }



    async 平仓回合(symbol2: BaseType.BitmexSymbol) {
        const symbol = symbol2 as 'XBTUSD'

        if (this.ws.isConnected === false) return //ws 断开了 
        if (this.有委托(symbol) === false && this.get仓位(symbol) === undefined) return //没有委托和仓位 
        if (this.有委托(symbol) && this.get仓位(symbol) === undefined) { //有委托没仓位
            await BitMEXOrderAPI.cancelAll(this.cookie, symbol)
            return
        }

        if (this.jsonSync.rawData.symbol[symbol] === undefined) {
            return '找不到 symbol'
        }

        if (this.jsonSync.rawData.symbol[symbol].状态 !== '--') {
            return '不是 -- '
        }
        this.jsonSync.data.symbol[symbol].状态.____set('平仓中')


        //

        if (isNaN(this.get当前止损价格(symbol))) {
            this.jsonSync.data.symbol[symbol].msg.____set('没有止损  10点止损')
            const 止损价 = this.get止损成本价(symbol) + (this.get止损side(symbol) === 'Buy' ? 10 : -10)
            await BitMEXOrderAPI.stop(this.cookie, {
                symbol,
                side: this.get止损side(symbol),
                price: () => 止损价
            })
            await sleep(2000)//等ws回止损
        }
        else if (this.get浮盈点数(symbol) >= 10) {
            const 止损价 = this.get止损成本价(symbol) + (this.get止损side(symbol) === 'Buy' ? -3 : 3)
            if (止损价 !== this.get当前止损价格(symbol)) {
                this.jsonSync.data.symbol[symbol].msg.____set('浮盈大于10点 止损挪到成交价+3浮盈价')
                await BitMEXOrderAPI.cancelAll(this.cookie, symbol)
                await BitMEXOrderAPI.stop(this.cookie, {
                    symbol,
                    side: this.get止损side(symbol),
                    price: () => 止损价
                })
                //不用等

                //同时期货走平3秒开始挂单成交 ????????
                const xxxxxx = this.get仓位(symbol)
                if (xxxxxx !== undefined) {
                    if (await 期货走平X({
                        symbol,
                        side: this.get止损side(symbol),
                        超时秒: 10,
                        走平秒: 3,
                        偏移: 0,
                    })) {
                        this.jsonSync.data.symbol[symbol].msg.____set('浮盈大于10点 止损挪到成交价+3浮盈价 同时期货走平3秒开始挂单成交')
                        只减仓(this.cookie, {
                            symbol,
                            side: this.get止损side(symbol),
                            size: Math.abs(xxxxxx.仓位数量)
                        })
                        await sleep(2000)//等ws 
                    }
                }
            }
        }
        else if (this.get浮盈点数(symbol) >= 5) {
            const 止损价 = this.get止损成本价(symbol)
            if (止损价 !== this.get当前止损价格(symbol)) {
                this.jsonSync.data.symbol[symbol].msg.____set('浮盈大于5点  止损挪到成交价 ')
                await BitMEXOrderAPI.cancelAll(this.cookie, symbol)
                await BitMEXOrderAPI.stop(this.cookie, {
                    symbol,
                    side: this.get止损side(symbol),
                    price: () => 止损价
                })
                await sleep(2000)//等ws回止损
            }
        }


        return ''
    }


}