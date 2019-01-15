import { BitMEXWSAPI } from '../lib/BitMEX/BitMEXWSAPI'
import { BaseType } from '../lib/BaseType'
import { lastNumber } from '../lib/F/lastNumber'
import { createJSONSync } from './____API____'
import { realData, 下单, 现货走平X, 期货走平X } from './realData'
import * as fs from 'fs'

export class Account {
    jsonSync = createJSONSync()
    private ws: BitMEXWSAPI
    private cookie: string
    private accountName: string

    constructor(p: { accountName: string, cookie: string }) {
        this.accountName = p.accountName
        this.cookie = p.cookie

        this.ws = new BitMEXWSAPI(p.cookie, [
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


    async 走平挂单(req: {
        side: BaseType.Side,
        size: number,
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


        const 下单2 = async () => await 下单(this.cookie, {
            symbol: req.期货.symbol,
            side: req.side,
            size: req.size,
            type: 'maker',
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
            fs.writeFileSync(`./db/${this.accountName}_${req.期货.symbol}_开仓回合.txt`, new Date().toLocaleString() + '  ' + msg + '\n', {
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
        if (await 下单2() === false) {
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
        if (await 下单2() === false) {
            this.jsonSync.data.symbol[symbol].状态.____set('--')
            return log(`期货走平后__下单失败`)
        } else {
            this.jsonSync.data.symbol[symbol].状态.____set('--')
            return log(`期货走平后__下单成功`) //<------------
        }
    }
}