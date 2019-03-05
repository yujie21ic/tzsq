import { JSONSync } from '../lib/C/JSONSync'
import { BaseType } from '../lib/BaseType'
import { sum } from 'ramda'
import { 指标 } from './指标'
import { kvs } from '../lib/F/kvs'
import { to范围 } from '../lib/F/to范围'
import { lastNumber } from '../lib/F/lastNumber'
import { is连续几根全亮 } from '../lib/C/is连续几根全亮'
import { timeID } from '../lib/F/timeID'



export class RealDataBase {
    static 单位时间 = 500

    删除历史() {
        const length = Math.min(

            //hopex
            this.jsonSync.rawData.hopex.BTCUSDT.data.length,
            this.jsonSync.rawData.hopex.BTCUSDT.orderBook.length,

            this.jsonSync.rawData.hopex.ETHUSDT.data.length,
            this.jsonSync.rawData.hopex.ETHUSDT.orderBook.length,

            //bitmex
            this.jsonSync.rawData.bitmex.XBTUSD.data.length,
            this.jsonSync.rawData.bitmex.XBTUSD.orderBook.length,

            this.jsonSync.rawData.bitmex.ETHUSD.data.length,
            this.jsonSync.rawData.bitmex.ETHUSD.orderBook.length,

            //binance
            this.jsonSync.rawData.binance.btcusdt.data.length,
            this.jsonSync.rawData.binance.btcusdt.orderBook.length,

            this.jsonSync.rawData.binance.ethusdt.data.length,
            this.jsonSync.rawData.binance.ethusdt.orderBook.length,
        )

        //>5000 删除2000
        if (length > 5000) {

            const deleteCount = 2000
            this.jsonSync.rawData.startTick += deleteCount

            //hopex
            this.jsonSync.rawData.hopex.BTCUSDT.data.splice(0, deleteCount)
            this.jsonSync.rawData.hopex.BTCUSDT.orderBook.splice(0, deleteCount)

            this.jsonSync.rawData.hopex.ETHUSDT.data.splice(0, deleteCount)
            this.jsonSync.rawData.hopex.ETHUSDT.orderBook.splice(0, deleteCount)

            //bitmex
            this.jsonSync.rawData.bitmex.XBTUSD.data.splice(0, deleteCount)
            this.jsonSync.rawData.bitmex.XBTUSD.orderBook.splice(0, deleteCount)

            this.jsonSync.rawData.bitmex.ETHUSD.data.splice(0, deleteCount)
            this.jsonSync.rawData.bitmex.ETHUSD.orderBook.splice(0, deleteCount)

            //binance
            this.jsonSync.rawData.binance.btcusdt.data.splice(0, deleteCount)
            this.jsonSync.rawData.binance.btcusdt.orderBook.splice(0, deleteCount)

            this.jsonSync.rawData.binance.ethusdt.data.splice(0, deleteCount)
            this.jsonSync.rawData.binance.ethusdt.orderBook.splice(0, deleteCount)

            this.重新初始化()
        }


    }

    get data() {
        return this.jsonSync.rawData
    }


    jsonSync = new JSONSync(
        {
            startTick: 0,
            //TODO
            hopex: {
                BTCUSDT: {
                    data: [] as BaseType.KLine[],
                    orderBook: [] as BaseType.OrderBook[],
                },
                ETHUSDT: {
                    data: [] as BaseType.KLine[],
                    orderBook: [] as BaseType.OrderBook[],
                },
            },
            bitmex: {
                XBTUSD: {
                    data: [] as BaseType.KLine[],
                    orderBook: [] as BaseType.OrderBook[],
                },
                ETHUSD: {
                    data: [] as BaseType.KLine[],
                    orderBook: [] as BaseType.OrderBook[],
                }
            },
            binance: {
                btcusdt: {
                    data: [] as BaseType.KLine[],
                    orderBook: [] as BaseType.OrderBook[],
                },
                ethusdt: {
                    data: [] as BaseType.KLine[],
                    orderBook: [] as BaseType.OrderBook[],
                },
            }
        }
    )


    get期货多少秒内最高最低(symbol: BaseType.BitmexSymbol, second: number) {
        second = second * (1000 / RealDataBase.单位时间)

        const data = this.data.bitmex[symbol].data

        let high = NaN
        let low = NaN

        if (data.length >= second) {
            for (let i = data.length - 1; i >= data.length - second; i--) {
                if (isNaN(high)) {
                    high = data[i].high
                } else {
                    high = Math.max(high, data[i].high)
                }

                if (isNaN(low)) {
                    low = data[i].low
                } else {
                    low = Math.max(low, data[i].low)
                }
            }
        }
        return { high, low }
    }
    macd(arr: ArrayLike<number>) {
        const _12 = 指标.EMA(arr, 12, RealDataBase.单位时间)
        const _26 = 指标.EMA(arr, 26, RealDataBase.单位时间)
        const DIF = 指标.lazyMapCache(() => Math.min(_12.length, _26.length), i => _12[i] - _26[i])
        const DEM = 指标.EMA(DIF, 9, RealDataBase.单位时间)
        return { DIF, DEM }
    }


    //!!!
    get现货多少秒内成交量(symbol: BaseType.BinanceSymbol, second: number) {
        second = second * (1000 / RealDataBase.单位时间)
        let volume = 0
        const data = this.data.binance[symbol].data
        if (data.length >= second) {
            for (let i = data.length - 1; i >= data.length - second; i--) {
                volume += data[i].buySize + data[i].sellSize
            }
            return volume
        } else {
            return NaN
        }
    }

    //!!!
    get期货多少秒内成交量__万为单位(symbol: BaseType.BitmexSymbol, second: number) {
        second = second * (1000 / RealDataBase.单位时间)
        let volume = 0
        const data = this.data.bitmex.XBTUSD.data
        if (data.length >= second) {
            for (let i = data.length - 1; i >= data.length - second; i--) {
                volume += data[i].buySize + data[i].sellSize
            }
            return volume / 10000
        } else {
            return NaN
        }
    }






    private item2({ data, orderBook }: {
        data: BaseType.KLine[]
        orderBook: BaseType.OrderBook[]
    }, 盘口算价格: boolean) {

        const 收盘价 = 指标.lazyMapCache(() => data.length, i => data[i].close)

        const 价格 = 盘口算价格 ?
            指标.lazyMapCache(() => orderBook.length, i =>
                (orderBook[i].buy && orderBook[i].buy.length > 0 && orderBook[i].sell && orderBook[i].sell.length > 0) ?
                    ((orderBook[i].buy[0].price + orderBook[i].sell[0].price) / 2) : NaN) :
            指标.lazyMapCache(() => data.length, i => data[i].close)

        //时间
        const 时间 = 指标.lazyMapCache(() => data.length, i => timeID._500msIDToTimestamp(data[i].id))


        //价格
        const 价格_均线300 = 指标.均线(价格, 300, RealDataBase.单位时间)
        const 价格_波动率30 = 指标.波动率(价格, 30, RealDataBase.单位时间)
        const 价格_波动率300 = 指标.波动率(价格, 300, RealDataBase.单位时间)
        const 折返率 = 指标.lazyMapCache(() => 价格_波动率30.length, i => 价格_波动率30[i] / 10 + 1)

        //成交量
        const 成交量买 = 指标.lazyMapCache(() => data.length, i => data[i].buySize)
        const 成交量买_累加5 = 指标.累加(成交量买, 5, RealDataBase.单位时间)

        const 成交量卖 = 指标.lazyMapCache(() => data.length, i => data[i].sellSize)
        const 成交量卖_累加5 = 指标.累加(成交量卖, 5, RealDataBase.单位时间)

        const 净成交量 = 指标.lazyMapCache(() => Math.min(成交量买.length, 成交量卖.length), i => 成交量买[i] - 成交量卖[i])
        const 净成交量_累加5 = 指标.累加(净成交量, 5, RealDataBase.单位时间)
        const 净成交量_累加60 = 指标.累加(净成交量, 60, RealDataBase.单位时间)
        const 净成交量_累加500 = 指标.累加(净成交量, 500, RealDataBase.单位时间)
        const 净成交量_macd = this.macd(净成交量_累加60)

        //盘口
        const 盘口买 = 指标.lazyMapCache(() => orderBook.length, i => sum(orderBook[i].buy.map(v => v.size)))
        const 盘口买_均线_1d5 = 指标.均线(盘口买, 1.5, RealDataBase.单位时间)

        const 盘口卖 = 指标.lazyMapCache(() => orderBook.length, i => sum(orderBook[i].sell.map(v => v.size)))
        const 盘口卖_均线_1d5 = 指标.均线(盘口卖, 1.5, RealDataBase.单位时间)

        const 净盘口 = 指标.lazyMapCache(() => Math.min(盘口买.length, 盘口卖.length), i => 盘口买[i] - 盘口卖[i])
        const 净盘口_均线5 = 指标.均线(净盘口, 5, RealDataBase.单位时间)

        //阻力3
        const 阻力3 = 指标.阻力3({ price: 价格, volumeBuy: 成交量买, volumeSell: 成交量卖, })
        const 阻力3涨 = 指标.lazyMapCache(() => 阻力3.length, i => Math.max(0, 阻力3[i].阻力))
        const 阻力3跌 = 指标.lazyMapCache(() => 阻力3.length, i => Math.min(0, 阻力3[i].阻力))
        const 真空信号涨 = 指标.lazyMapCache(() => 价格.length, i => (阻力3[i].阻力 < 150000) && 阻力3[i].阻力 > 0 && 阻力3[i].价钱增量 >= to范围({ min: 4, max: 12, value: 价格_波动率30[i] / 10 }))
        const 真空信号跌 = 指标.lazyMapCache(() => 价格.length, i => (阻力3[i].阻力 > -150000) && 阻力3[i].阻力 < 0 && 阻力3[i].价钱增量 >= to范围({ min: 4, max: 12, value: 价格_波动率30[i] / 10 }))

        //上涨_下跌
        const 价格_最高15 = 指标.最高(价格, 15, RealDataBase.单位时间)
        const 价格_最低15 = 指标.最低(价格, 15, RealDataBase.单位时间)
        const 上涨_下跌 = 指标.lazyMapCache(() => Math.min(净成交量_累加60.length), i => 净成交量_累加60[i] >= 0 ? '上涨' : '下跌')

        const 价格差_除以时间 = 指标.lazyMapCache2({ 起点index: NaN, 起点Type: 'none' as '上涨' | '下跌' }, (arr: number[], ext) => {
            const length = Math.min(价格_波动率30.length, 上涨_下跌.length)

            let 上涨下跌价差 = (xx: '上涨' | '下跌') => xx === '上涨' ? 上涨_价差 : 下跌_价差 //每个地方都不同！！！！


            for (let i = Math.max(0, arr.length - 1); i < length; i++) {
                //开始
                if (isNaN(ext.起点index) || ext.起点index === length - 1) {   //最后一个重新计算  
                    if (上涨下跌价差(上涨_下跌[i])[i] >= 2) { //<---------------------------------------------------
                        ext.起点index = i
                        ext.起点Type = 上涨_下跌[i]
                    }
                }
                //结束
                else {
                    if (上涨下跌价差(ext.起点Type)[i] >= 200 || 上涨_下跌[i] !== ext.起点Type) { //<---------------------------------------------------
                        ext.起点index = NaN
                    }
                }


                let a = i - ext.起点index
                if (a === 0) a = NaN
                arr[i] = isNaN(ext.起点index) === false && 上涨下跌价差(ext.起点Type)[i] >= 4 ? 上涨下跌价差(ext.起点Type)[i] / a : NaN  //除以根数 
                //<---------------------------------------------------
            }
        })



        const 震荡指数 = 指标.lazyMapCache(() => Math.min(上涨_价差.length, 下跌_价差.length, 上涨_下跌.length, 价格_波动率30.length), i => {
            const 上涨下跌价差 = (上涨_下跌[i] === '上涨' ? 上涨_价差 : 下跌_价差)[i]
            return 上涨下跌价差 > 2 ? 价格_波动率30[i] / 上涨下跌价差 : NaN

        })


        const 震荡指数_macd = this.macd(震荡指数)


        const 累计成交量 = (type: '上涨' | '下跌') => 指标.lazyMapCache2({ 累计成交量: NaN }, (arr: number[], ext) => {
            const length = Math.min(上涨_下跌.length, 成交量买.length, 成交量卖.length)
            for (let i = Math.max(0, arr.length - 1); i < length; i++) {
                if (上涨_下跌[i] === type) {
                    if (isNaN(ext.累计成交量)) {
                        ext.累计成交量 = 0
                    }
                    if (i !== length - 1) {
                        ext.累计成交量 += (type === '上涨' ? 成交量买[i] - 成交量卖[i] : 成交量卖[i] - 成交量买[i])   //最后一个重新计算
                    }
                } else {
                    ext.累计成交量 = NaN
                }
                arr[i] = ext.累计成交量 + (type === '上涨' ? 成交量买[i] - 成交量卖[i] : 成交量卖[i] - 成交量买[i])
            }
        })

        const 价差 = (type: '上涨' | '下跌') => 指标.lazyMapCache2({ 起点价格: NaN }, (arr: number[], ext) => {
            const length = Math.min(上涨_下跌.length, 价格_最高15.length, 价格_最低15.length)
            for (let i = Math.max(0, arr.length - 1); i < length; i++) {//最高价10 最低价10 一样长
                if (上涨_下跌[i] === type) {
                    if (isNaN(ext.起点价格)) {
                        ext.起点价格 = 价格[i]    //最后一个重新计算   不用
                    }
                } else {
                    ext.起点价格 = NaN
                }

                if (isNaN(ext.起点价格)) {
                    arr[i] = NaN
                }
                else if (type === '上涨') {
                    arr[i] = 价格_最高15[i] - ext.起点价格
                }
                else if (type === '下跌') {
                    arr[i] = ext.起点价格 - 价格_最低15[i]
                }
            }
        })

        const 价差走平 = 指标.lazyMapCache(() => Math.min(上涨_下跌.length, 上涨_价差.length, 下跌_价差.length), i => {
            const x = (上涨_下跌[i] === '上涨' ? 上涨_价差 : 下跌_价差)
            return i >= 1 && x[i] - x[i - 1] <= 0
        })



        const 价差走平多少根 = 指标.lazyMapCache2({}, (arr: number[]) => {
            const length = 价差走平.length
            for (let i = Math.max(0, arr.length - 1); i < length; i++) {
                arr[i] = 价差走平[i] ? arr[i - 1] + 1 : 0
            }
        })


        const 价差走平x秒 = 指标.lazyMapCache(
            () => Math.min(价差走平多少根.length, 上涨_价差.length, 下跌_价差.length),
            i => 价差走平多少根[i] >= ((上涨_下跌[i] === '上涨' ? 上涨_价差 : 下跌_价差)[i] / 8) * 2,
        )


        const 上涨_累计成交量 = 累计成交量('上涨')
        const 上涨_价差 = 价差('上涨')
        const 上涨_动力 = 指标.lazyMapCache(() => Math.min(上涨_累计成交量.length, 上涨_价差.length), i => to范围({ min: 30 * 10000, max: 130 * 10000, value: 上涨_累计成交量[i] / Math.max(1, 上涨_价差[i]) })) //最小除以1
        const 上涨 = {
            累计成交量: 上涨_累计成交量,
            价差: 上涨_价差,
            动力: 上涨_动力,
        }

        const 下跌_累计成交量 = 累计成交量('下跌')
        const 下跌_价差 = 价差('下跌')
        const 下跌_动力 = 指标.lazyMapCache(() => Math.min(下跌_累计成交量.length, 下跌_价差.length), i => to范围({ min: 30 * 10000, max: 130 * 10000, value: 下跌_累计成交量[i] / Math.max(1, 下跌_价差[i]) })) //最小除以1
        const 下跌 = {
            累计成交量: 下跌_累计成交量,
            价差: 下跌_价差,
            动力: 下跌_动力,
        }


        const 价差中大分界 = 20
        const 价差大巨大分界 = 100
        const 信号_上涨 = 指标.lazyMapCache(
            () => Math.min(
                净盘口.length,
                净盘口_均线5.length,
                盘口买_均线_1d5.length,
                价格_波动率30.length,
                价格_波动率30.length,
            ),
            i => {
                let b = false
                if (上涨_价差[i] < 价差中大分界) {
                    if (盘口买[i] < 100 * 10000) {
                        if (净盘口[i] <= (净盘口_均线5[i] + 50 * 10000)) {
                            if (净盘口[i] < 5 * 100000) {
                                b = true
                            }
                        }
                    } else {
                        if (盘口买[i] < 150 * 10000) {
                            if (净盘口[i] <= (净盘口_均线5[i])) {
                                if (净盘口[i] < 0) {
                                    b = true
                                }
                            }
                        }
                    }
                } else {
                    if (盘口买[i] < 50 * 10000) {
                        if (净盘口[i] <= (净盘口_均线5[i] + 50 * 10000)) {
                            if (净盘口[i] < 5 * 100000) {
                                b = true
                            }
                        }
                    } else {
                        if (盘口买[i] < 100 * 10000) {
                            if (净盘口[i] <= (净盘口_均线5[i])) {
                                if (净盘口[i] < 0) {
                                    b = true
                                }
                            }
                        }
                    }
                }
                if (b === false) {
                    if (上涨_价差[i] > 价差中大分界) {
                        if (真空信号涨[i]) {
                            if (盘口买[i] < 200 * 10000) {
                                b = true
                            }

                        }
                    }
                }
                if (b === true) {
                    if (盘口买[i] > 250 * 10000) {
                        b = false
                    }
                }
                let c = false
                if (上涨_价差[i] < 价差中大分界) {
                    if (净成交量_macd.DIF[i] < 净成交量_macd.DEM[i]) {
                        c = true
                    } else {
                        if (净成交量_macd.DIF[i] < 净成交量_macd.DEM[i] * 1.1) {
                            if (净成交量_累加5[i] < 50 * 10000) {
                                c = true
                            }
                        }
                    }
                } else {
                    if (净成交量_macd.DIF[i] < 净成交量_macd.DEM[i] && 净成交量_macd.DIF[i] < 0) {
                        c = true
                    } else {
                        if (净成交量_macd.DIF[i] < 净成交量_macd.DEM[i] * 1.1) {
                            if (净成交量_累加5[i] < 50 * 10000) {
                                c = true
                            }
                        }
                    }
                }


                return [
                    { name: '震荡指数', value: 震荡指数[i] < 1.1 || 震荡指数_macd.DIF[i] < 震荡指数_macd.DEM[i] || 价差走平x秒[i] },
                    { name: '成交量DIF<DEM', value: c },
                    { name: ' 净盘口<净盘口均线<0', value: b },
                    { name: '30秒净买成交量 >=150万', value: 净成交量_累加60[i] >= 150 * 10000 },
                    { name: '折返程度<', value: (价格_最高15[i] - 价格[i]) < 折返率[i] },
                    { name: '价格速度', value: 上涨_价差[i] > 价差中大分界 || 价格差_除以时间[i] >= 0.1 },
                    { name: '上涨_价差 >=6', value: 上涨_价差[i] >= 6 },
                    { name: '量化 is上涨', value: 上涨_下跌[i] === '上涨' },
                    { name: '波动率最大限制', value: 上涨_价差[i] < 价差大巨大分界 },
                ]
            }
        )
        const 信号_上涨做空下跌平仓 = 指标.lazyMapCache(
            () => Math.min(
                净盘口.length,
                净盘口_均线5.length,
                盘口买_均线_1d5.length,
                价格_波动率30.length,
                净成交量_macd.DIF.length,
                净成交量_macd.DEM.length,
                价格_波动率30.length,
            ),
            i =>
                [
                    { name: '成交量DIF<DEM', value: 净成交量_macd.DIF[i] < 净成交量_macd.DEM[i] },
                    { name: '折返程度<', value: (价格_最高15[i] - 价格[i]) > 折返率[i] },
                ]
        )
        const 信号_追涨 = 指标.lazyMapCache(
            () => Math.min(
                净盘口.length,
                净盘口_均线5.length,
                盘口买_均线_1d5.length,
                价格_波动率30.length,
                净成交量_macd.DIF.length,
                净成交量_macd.DEM.length,
                价格_波动率30.length,
            ),
            i =>
                [
                    { name: '净盘口>0', value: 净盘口[i] > 0 },
                    { name: '5分钟波动率低量', value: 价格_波动率300[i] < 30 },
                    { name: '大单', value: 净成交量_累加5[i] > 100 * 10000 },
                    { name: '上涨_价差<4', value: 上涨_价差[i] <= 4 },
                    { name: '折返程度<', value: (价格_最高15[i] - 价格[i]) < 折返率[i] },
                    { name: '量化 is上涨', value: 上涨_下跌[i] === '上涨' },
                ]
        )


        //下跌 重复

        const 信号_下跌 = 指标.lazyMapCache(
            () => Math.min(
                净盘口.length,
                净盘口_均线5.length,
                盘口卖_均线_1d5.length,
                价格_波动率30.length,
                净成交量_macd.DIF.length,
                净成交量_macd.DEM.length,
                价格_波动率30.length,
            ),
            i => {
                let b = false
                if (下跌_价差[i] < 价差中大分界) {
                    if (盘口卖[i] < 100 * 10000) {
                        if (净盘口[i] >= (净盘口_均线5[i] - 50 * 10000)) {
                            if (净盘口[i] > (- 50 * 10000)) {
                                b = true
                            }
                        }
                    } else {
                        if (盘口卖[i] < 150 * 10000) {
                            if (净盘口[i] >= 净盘口_均线5[i]) {
                                if (净盘口[i] > 0) {
                                    b = true
                                }
                            }
                        }
                    }
                } else {
                    if (盘口卖[i] < 50 * 10000) {
                        if (净盘口[i] >= (净盘口_均线5[i] - 50 * 10000)) {
                            if (净盘口[i] > (- 50 * 10000)) {
                                b = true
                            }
                        }
                    } else {
                        if (盘口卖[i] < 100 * 10000) {
                            if (净盘口[i] >= 净盘口_均线5[i]) {
                                if (净盘口[i] > 0) {
                                    b = true
                                }
                            }
                        }
                    }
                }
                if (b === false) {
                    if (下跌_价差[i] > 价差中大分界) {
                        if (真空信号涨[i]) {
                            if (盘口卖[i] < 150 * 10000) {
                                b = true
                            }

                        }
                    }
                }
                if (b === true) {
                    if (盘口卖[i] > 250 * 10000) {
                        b = false
                    }
                }
                let c = false
                if (下跌_价差[i] < 价差中大分界) {
                    if (净成交量_macd.DIF[i] < 净成交量_macd.DEM[i]) {
                        c = true
                    } else if (净成交量_macd.DIF[i] < 净成交量_macd.DEM[i] * 0.9) {
                        if (净成交量_累加5[i] < 50 * 10000) {
                            c = true
                        }
                    }
                } else {
                    if (净成交量_macd.DIF[i] < 净成交量_macd.DEM[i] && 净成交量_macd.DIF[i] < 0) {
                        c = true
                    } else {
                        if (净成交量_macd.DIF[i] < 净成交量_macd.DEM[i] * 0.9) {
                            if (净成交量_累加5[i] < 50 * 10000) {
                                c = true
                            }
                        }
                    }
                }

                return [
                    { name: '震荡指数', value: 震荡指数[i] < 1.1 || 震荡指数_macd.DIF[i] < 震荡指数_macd.DEM[i] || 价差走平x秒[i] },
                    { name: '卖成交量DIF<DEM', value: c },
                    { name: ' 净盘口 > 净盘口均线>0', value: b },
                    { name: '30秒净卖成交量>150万', value: 净成交量_累加60[i] <= -150 * 10000 },
                    { name: '折返程度<', value: (价格[i] - 价格_最低15[i]) < 折返率[i] },
                    { name: '价格速度', value: 下跌_价差[i] > 价差中大分界 || 价格差_除以时间[i] >= 0.1 },
                    { name: '下跌_价差 >=6', value: 下跌_价差[i] >= 6 },
                    { name: '量化 is下跌', value: 上涨_下跌[i] === '下跌' },
                    { name: '下跌_价差最大限制', value: 下跌_价差[i] < 价差大巨大分界 },
                ]
            }
        )

        const 信号_下跌抄底上涨平仓 = 指标.lazyMapCache(
            () => Math.min(
                净盘口.length,
                净盘口_均线5.length,
                盘口卖_均线_1d5.length,
                价格_波动率30.length,
                净成交量_macd.DIF.length,
                净成交量_macd.DEM.length,
                价格_波动率30.length,
            ),
            i =>
                [
                    { name: '卖成交量DIF<DEM', value: 净成交量_macd.DIF[i] < 净成交量_macd.DEM[i] },
                    { name: '折返程度<', value: (价格[i] - 价格_最低15[i]) > 折返率[i] },
                ]
        )

        const 信号_追跌 = 指标.lazyMapCache(
            () => Math.min(
                净盘口.length,
                净盘口_均线5.length,
                盘口卖_均线_1d5.length,
                价格_波动率30.length,
                净成交量_macd.DIF.length,
                净成交量_macd.DEM.length,
                价格_波动率30.length,
            ),
            i =>
                [
                    { name: '净盘口<0', value: 净盘口[i] < 0 },
                    { name: '5分钟波动率低量', value: 价格_波动率300[i] < 30 },
                    { name: '下跌_价差<4', value: 下跌_价差[i] <= 4 },
                    { name: '大单', value: 净成交量_累加5[i] < -100 * 10000 },
                    { name: '折返程度<', value: (价格[i] - 价格_最低15[i]) < 折返率[i] },
                    { name: '量化 is下跌', value: 上涨_下跌[i] === '下跌' },
                ]
        )


        return {

            震荡指数macd: 震荡指数_macd,
            震荡指数,
            最新价: 收盘价,
            盘口: orderBook,
            时间,
            波动率5分钟: 价格_波动率300,
            净成交量10: 净成交量_累加5,
            净成交量120: 净成交量_累加500,
            折返率,
            成交量买,
            成交量卖,
            信号_上涨做空下跌平仓,
            信号_下跌抄底上涨平仓,
            价格差_除以时间,
            上涨_下跌,

            价格均线: 价格_均线300,
            净成交量macd: 净成交量_macd,
            上涨,
            上涨_价差,
            下跌,
            价格, 波动率: 价格_波动率30, 盘口买, 盘口卖, 净盘口, 净盘口均线: 净盘口_均线5,
            阻力3涨, 阻力3跌,
            真空信号涨,
            真空信号跌,
            净成交量,
            净成交量60: 净成交量_累加60,

            成交量买均线5: 成交量买_累加5,
            成交量卖均线5: 成交量卖_累加5,
            信号_上涨,
            信号_追涨,
            信号_下跌,
            信号_追跌,

            最高价10: 价格_最高15,
            最低价10: 价格_最低15,
        }
    }


    private item = (symbol: BaseType.BitmexSymbol, binanceSymbol: BaseType.BinanceSymbol, hopexSymbol: BaseType.HopexSymbol) => {

        const 现货 = this.item2(this.data.binance[binanceSymbol], false)

        const 期货 = this.item2(this.data.bitmex[symbol], true)

        const hopex = this.item2(this.data.hopex[hopexSymbol], false)

        //差价
        const 差价 = 指标.lazyMapCache(() => Math.min(现货.价格.length, 期货.价格.length), i => 现货.价格[i] - 期货.价格[i])
        const 差价均线 = 指标.均线(差价, 300, RealDataBase.单位时间)



        const bitmex_hopex_差价 = 指标.lazyMapCache(() => Math.min(期货.价格.length, hopex.价格.length), i => Math.abs(期货.价格[i] - hopex.价格[i]))
        const bitmex_hopex_差价均线 = 指标.均线(bitmex_hopex_差价, 5, RealDataBase.单位时间)


        // XXX = 波动率[i] / 5 + 2

        // 折返 =  当前价  -  当前10s极值

        // bm信号---> （ 5秒内 bm价格折返 > XXX ） ---> （当前时间 hopex价格折返 < XXX/2）   --->下单

        const _5秒内有全亮 = (arr: ArrayLike<{
            name: string
            value: boolean
        }[]>, index: number) => {
            let 连续几根 = 0
            for (let i = index; i >= Math.max(0, index - 5 * (1000 / RealDataBase.单位时间)); i--) {
                if (arr[i].every(v => v.value)) {
                    连续几根++
                    if (连续几根 === 3) return true
                } else {
                    连续几根 = 0
                }
            }
            return false
        }

        const 信号hopex_下跌 = 指标.lazyMapCache(
            () => Math.min(期货.信号_下跌.length, 期货.价格.length, 期货.波动率.length, hopex.价格.length),
            i => [
                { name: '5秒内信号', value: _5秒内有全亮(期货.信号_下跌, i) },
                { name: '期货.波动率[i] >10 ', value: 期货.波动率[i] > 10 },
                { name: 'bm折返 >', value: 期货.价格[i] - 期货.最低价10[i] > 期货.折返率[i] },
                { name: 'hp折返 <', value: hopex.价格[i] - hopex.最低价10[i] < 期货.折返率[i] / 2 },
            ]
        )

        const 信号hopex_上涨 = 指标.lazyMapCache(
            () => Math.min(期货.信号_上涨.length, 期货.价格.length, 期货.波动率.length, hopex.价格.length),
            i => [
                { name: '5秒内信号', value: _5秒内有全亮(期货.信号_上涨, i) },
                { name: '期货.波动率[i] >10 ', value: 期货.波动率[i] > 10 },
                { name: 'bm折返 >', value: 期货.最高价10[i] - 期货.价格[i] > 期货.折返率[i] },
                { name: 'hp折返 <', value: hopex.最高价10[i] - hopex.价格[i] < 期货.折返率[i] / 2 },
            ]
        )


        return {
            bitmex_hopex_差价,
            bitmex_hopex_差价均线,

            信号hopex_下跌,
            信号hopex_上涨,
            现货减去: 0,
            //现货
            现货,
            现货减去价格: 现货.价格,
            现货减去价格均线: 现货.价格均线,
            现货30秒内成交量: () => this.get现货多少秒内成交量(binanceSymbol, 30),

            //期货
            期货,
            期货30秒内成交量: () => this.get期货多少秒内成交量__万为单位(symbol, 30),
            //差价
            差价,
            差价均线,

            //hopex,
            hopex,
        }
    }

    dataExt = {
        XBTUSD: this.item('XBTUSD', 'btcusdt', 'BTCUSDT'),
        ETHUSD: this.item('ETHUSD', 'ethusdt', 'ETHUSDT'),
    }

    重新初始化 = () => {
        this.dataExt = {
            XBTUSD: this.item('XBTUSD', 'btcusdt', 'BTCUSDT'),
            ETHUSD: this.item('ETHUSD', 'ethusdt', 'ETHUSDT'),
        }
    }

    set现货减去(n: number) {
        const arr = kvs(this.dataExt)
        arr.forEach(({ v }) => {
            if (v.现货减去 !== n) {
                v.现货减去 = n
                v.现货减去价格 = 指标.lazyMapCache(() => v.现货.价格.length, i => v.现货.价格[i] - n)
                v.现货减去价格均线 = 指标.lazyMapCache(() => v.现货.价格均线.length, i => v.现货.价格均线[i] - n)
            }
        })
    }



    getOrderPrice = ({ symbol, side, type, 位置 }: { symbol: BaseType.BitmexSymbol, side: BaseType.Side, type: 'taker' | 'maker', 位置: number }) => {
        const pk = this.dataExt[symbol].期货.盘口

        if (pk.length < 1) return NaN
        const p = pk[pk.length - 1]

        if (side === 'Buy') {
            if (type === 'taker') {
                return p.sell[位置] ? p.sell[位置].price : NaN
            } else {
                return p.buy[位置] ? p.buy[位置].price : NaN
            }
        } else if (side === 'Sell') {
            if (type === 'taker') {
                return p.buy[位置] ? p.buy[位置].price : NaN
            } else {
                return p.sell[位置] ? p.sell[位置].price : NaN
            }
        } else {
            return NaN
        }
    }




















    //
    get信号msg = (symbol: BaseType.BitmexSymbol) => {
        const realData = this
        const 上涨 = realData.dataExt[symbol].期货.信号_上涨
        const 下跌 = realData.dataExt[symbol].期货.信号_下跌
        const 追涨 = realData.dataExt[symbol].期货.信号_追涨
        const 追跌 = realData.dataExt[symbol].期货.信号_追跌

        return JSON.stringify({
            上涨: 上涨.length > 3 ? [上涨[上涨.length - 3], 上涨[上涨.length - 2], 上涨[上涨.length - 1]] : '',
            下跌: 下跌.length > 3 ? [下跌[下跌.length - 3], 下跌[下跌.length - 2], 下跌[下跌.length - 1]] : '',
            追涨: 追涨.length > 3 ? [追涨[追涨.length - 3], 追涨[追涨.length - 2], 追涨[追涨.length - 1]] : '',
            追跌: 追跌.length > 3 ? [追跌[追跌.length - 3], 追跌[追跌.length - 2], 追跌[追跌.length - 1]] : '',
            波动率: lastNumber(realData.dataExt[symbol].期货.波动率),
        })
    }




    摸顶抄底信号灯side___2根 = (symbol: BaseType.BitmexSymbol) => {
        const realData = this
        const up = realData.dataExt[symbol].期货.信号_上涨
        const down = realData.dataExt[symbol].期货.信号_下跌

        if (up.length > 2 && up[up.length - 1].every(v => v.value) && up[up.length - 2].every(v => v.value)) {
            return { 信号side: 'Sell' as 'Sell', 信号msg: realData.get信号msg(symbol) }
        }
        else if (down.length > 2 && down[down.length - 1].every(v => v.value) && down[down.length - 2].every(v => v.value)) {
            return { 信号side: 'Buy' as 'Buy', 信号msg: realData.get信号msg(symbol) }
        }
        else {
            return { 信号side: 'none' as 'none', 信号msg: '' }
        }
    }




    get信号灯Type = (symbol: BaseType.BitmexSymbol) => {
        const realData = this
        if (is连续几根全亮(3, realData.dataExt[symbol].期货.信号_上涨)) {
            return '摸顶'
        }
        else if (is连续几根全亮(3, realData.dataExt[symbol].期货.信号_下跌)) {
            return '抄底'
        }
        else if (is连续几根全亮(1, realData.dataExt[symbol].期货.信号_追涨)) {
            return '追涨'
        }
        else if (is连续几根全亮(1, realData.dataExt[symbol].期货.信号_追跌)) {
            return '追跌'
        } else {
            return 'none'
        }
    }











    get信号XXXmsg = (symbol: BaseType.BitmexSymbol) => {
        const 上涨做空下跌平仓 = this.dataExt[symbol].期货.信号_上涨做空下跌平仓
        const 下跌抄底上涨平仓 = this.dataExt[symbol].期货.信号_下跌抄底上涨平仓

        return JSON.stringify({
            上涨做空下跌平仓: 上涨做空下跌平仓.length > 3 ? [上涨做空下跌平仓[上涨做空下跌平仓.length - 3], 上涨做空下跌平仓[上涨做空下跌平仓.length - 2], 上涨做空下跌平仓[上涨做空下跌平仓.length - 1]] : '',
            下跌抄底上涨平仓: 下跌抄底上涨平仓.length > 3 ? [下跌抄底上涨平仓[下跌抄底上涨平仓.length - 3], 下跌抄底上涨平仓[下跌抄底上涨平仓.length - 2], 下跌抄底上涨平仓[下跌抄底上涨平仓.length - 1]] : '',
        })
    }


    is上涨做空下跌平仓 = (symbol: BaseType.BitmexSymbol) =>
        is连续几根全亮(2, this.dataExt[symbol].期货.信号_上涨做空下跌平仓)

    is下跌抄底上涨平仓 = (symbol: BaseType.BitmexSymbol) =>
        is连续几根全亮(2, this.dataExt[symbol].期货.信号_下跌抄底上涨平仓)


    get波动率 = (symbol: BaseType.BitmexSymbol) =>
        lastNumber(this.dataExt[symbol].期货.波动率)





}