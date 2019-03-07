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


    private 买卖(p: { 成交量: ArrayLike<number>, 盘口: ArrayLike<number>, 反向成交量: ArrayLike<number>, 反向盘口: ArrayLike<number> }) {

        const 净成交量 = 指标.lazyMapCache(() => Math.min(p.成交量.length, p.反向成交量.length), i => p.成交量[i] - p.反向成交量[i])
        const 净盘口 = 指标.lazyMapCache(() => Math.min(p.盘口.length, p.反向盘口.length), i => p.盘口[i] - p.反向盘口[i])
        const 净成交量_累加5 = 指标.累加(净成交量, 5, RealDataBase.单位时间)
        const 净成交量_累加60 = 指标.累加(净成交量, 60, RealDataBase.单位时间)
        const 净成交量_累加500 = 指标.累加(净成交量, 500, RealDataBase.单位时间)

        return {
            成交量: p.成交量,
            盘口: p.盘口,
            成交量_累加5: 指标.累加(p.成交量, 5, RealDataBase.单位时间),
            盘口_均线_1d5: 指标.均线(p.盘口, 1.5, RealDataBase.单位时间),
            净成交量,
            净成交量_累加5,
            净成交量_累加60,
            净成交量_累加500,
            净盘口,
            净盘口_均线5: 指标.均线(净盘口, 5, RealDataBase.单位时间),
            is趋势: 指标.lazyMapCache(() => Math.min(净成交量_累加60.length), i => 净成交量_累加60[i] >= 0),//买是上涨  卖是下跌
        }
    }


    private item2({ data, orderBook }: {
        data: BaseType.KLine[]
        orderBook: BaseType.OrderBook[]
    }, 盘口算价格: boolean) {

        //0阶
        const 收盘价 = 指标.lazyMapCache(() => data.length, i => data[i].close)

        const 价格 = 盘口算价格 ?
            指标.lazyMapCache(() => orderBook.length, i =>
                (orderBook[i].buy && orderBook[i].buy.length > 0 && orderBook[i].sell && orderBook[i].sell.length > 0) ?
                    ((orderBook[i].buy[0].price + orderBook[i].sell[0].price) / 2) : NaN) :
            指标.lazyMapCache(() => data.length, i => data[i].close)

        const 时间 = 指标.lazyMapCache(() => data.length, i => timeID._500msIDToTimestamp(data[i].id))
        const __成交量买 = 指标.lazyMapCache(() => data.length, i => data[i].buySize)
        const __成交量卖 = 指标.lazyMapCache(() => data.length, i => data[i].sellSize)
        const __盘口买 = 指标.lazyMapCache(() => orderBook.length, i => sum(orderBook[i].buy.map(v => v.size)))
        const __盘口卖 = 指标.lazyMapCache(() => orderBook.length, i => sum(orderBook[i].sell.map(v => v.size)))

        const 买 = this.买卖({
            成交量: __成交量买,
            盘口: __盘口买,
            反向成交量: __成交量卖,
            反向盘口: __盘口卖,
        })

        const 卖 = this.买卖({
            成交量: __成交量卖,
            盘口: __盘口卖,
            反向成交量: __成交量买,
            反向盘口: __盘口买,
        })


        //1阶
        //价格
        const 价格_均线300 = 指标.均线(价格, 300, RealDataBase.单位时间)
        const 价格_波动率30 = 指标.波动率(价格, 30, RealDataBase.单位时间)
        const 价格_波动率300 = 指标.波动率(价格, 300, RealDataBase.单位时间)
        const 折返率 = 指标.lazyMapCache(() => 价格_波动率30.length, i => 价格_波动率30[i] / 10 + 1)




        //_______________________________________________________________________________________________________________________________//
        const 净成交量abs = 指标.lazyMapCache(() => Math.min(买.成交量.length, 卖.成交量.length), i => Math.abs(买.成交量[i] - 卖.成交量[i]))
        const 净成交量abs_macd = 指标.macd(净成交量abs, RealDataBase.单位时间)

        //阻力3
        const 阻力3 = 指标.阻力3({ price: 价格, volumeBuy: 买.成交量, volumeSell: 卖.成交量, })
        const 阻力3涨 = 指标.lazyMapCache(() => 阻力3.length, i => Math.max(0, 阻力3[i].阻力))
        const 阻力3跌 = 指标.lazyMapCache(() => 阻力3.length, i => Math.min(0, 阻力3[i].阻力))
        const 真空信号涨 = 指标.lazyMapCache(() => 价格.length, i => (阻力3[i].阻力 < 150000) && 阻力3[i].阻力 > 0 && 阻力3[i].价钱增量 >= to范围({ min: 4, max: 12, value: 价格_波动率30[i] / 10 }))
        const 真空信号跌 = 指标.lazyMapCache(() => 价格.length, i => (阻力3[i].阻力 > -150000) && 阻力3[i].阻力 < 0 && 阻力3[i].价钱增量 >= to范围({ min: 4, max: 12, value: 价格_波动率30[i] / 10 }))

        //上涨_下跌
        const 价格_最高15 = 指标.最高(价格, 15, RealDataBase.单位时间)
        const 价格_最低15 = 指标.最低(价格, 15, RealDataBase.单位时间)
        const 上涨_下跌 = 指标.lazyMapCache(() => Math.min(买.净成交量_累加60.length), i => 买.净成交量_累加60[i] >= 0 ? '上涨' : '下跌')

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


        const 震荡指数_macd = 指标.macd(震荡指数, RealDataBase.单位时间)


        const 累计成交量 = (type: '上涨' | '下跌') => 指标.lazyMapCache2({ 累计成交量: NaN }, (arr: number[], ext) => {
            const length = Math.min(上涨_下跌.length, 买.成交量.length, 卖.成交量.length)
            for (let i = Math.max(0, arr.length - 1); i < length; i++) {
                if (上涨_下跌[i] === type) {
                    if (isNaN(ext.累计成交量)) {
                        ext.累计成交量 = 0
                    }
                    if (i !== length - 1) {
                        ext.累计成交量 += (type === '上涨' ? 买.成交量[i] - 卖.成交量[i] : 卖.成交量[i] - 买.成交量[i])   //最后一个重新计算
                    }
                } else {
                    ext.累计成交量 = NaN
                }
                arr[i] = ext.累计成交量 + (type === '上涨' ? 买.成交量[i] - 卖.成交量[i] : 卖.成交量[i] - 买.成交量[i])
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
        //_______________________________________________________________________________________________________________________________//


        const bitmex_hopex_差价: ArrayLike<number> = (指标.lazyMapCache(() => this.dataExt.XBTUSD.bitmex_hopex_差价.length, i => this.dataExt.XBTUSD.bitmex_hopex_差价[i])) as any
        const bitmex_hopex_差价均线 = 指标.均线(bitmex_hopex_差价, 60, RealDataBase.单位时间)
        const bitmex_hopex_相对价差 = 指标.lazyMapCache(() => Math.min(bitmex_hopex_差价.length, bitmex_hopex_差价均线.length), i => bitmex_hopex_差价[i] - bitmex_hopex_差价均线[i])
        const bitmex_hopex_差价macd = 指标.macd(bitmex_hopex_相对价差, RealDataBase.单位时间)


        const 价差中大分界 = 20
        const 价差大巨大分界 = 100

        const 摸顶抄底 = (type: '摸顶' | '抄底') => {
            const bs = type === '摸顶' ? 买 : 卖
            const 价差 = type === '摸顶' ? 上涨_价差 : 下跌_价差
            const 真空信号 = type === '摸顶' ? 真空信号涨 : 真空信号跌

            return 指标.lazyMapCache(
                () => Math.min(
                    data.length,
                    orderBook.length,
                ),
                i => {
                    //
                    const 小 = 价差[i] < 价差中大分界
                    const 大 = 价差[i] >= 价差中大分界

                    //盘口!! 
                    const v = bs.盘口[i] / 10000
                    const 盘口_0_50万 = v < 50
                    const 盘口_0_100万 = v < 100
                    const 盘口_0_200万 = v < 200
                    const 盘口_50_100万 = v >= 50 && v < 100
                    const 盘口_100_150万 = v >= 100 && v < 150
                    const A = bs.净盘口[i] <= bs.净盘口_均线5[i] + 50 * 10000 && bs.净盘口[i] < 5 * 100000
                    const B = bs.净盘口[i] <= bs.净盘口_均线5[i] && bs.净盘口[i] < 0
                    const 盘口XXX =
                        (小 && 盘口_0_100万 && A) ||
                        (小 && 盘口_100_150万 && B) ||
                        (大 && 盘口_0_200万 && 真空信号[i]) ||
                        (大 && 盘口_0_50万 && A) ||
                        (大 && 盘口_50_100万 && B)


                    //成交量衰竭
                    const v__0 = 净成交量abs_macd.DIF[i] < 0
                    const v__1 = 净成交量abs_macd.DIF[i] < 净成交量abs_macd.DEM[i]
                    const v__1_1 = 净成交量abs_macd.DIF[i] < 净成交量abs_macd.DEM[i] * 1.1
                    const 成交量衰竭 =
                        (v__1_1 && bs.净成交量_累加5[i] < 50 * 10000) ||
                        (小 && v__1) ||
                        (大 && v__0 && v__1)

                    return [
                        { name: '震荡指数', value: 震荡指数[i] < 1.1 || 震荡指数_macd.DIF[i] < 震荡指数_macd.DEM[i] || 价差走平x秒[i] },
                        { name: '成交量衰竭', value: 成交量衰竭 },
                        { name: '盘口 ！!', value: 盘口XXX },
                        { name: '60秒净买成交量 >= 150万', value: bs.净成交量_累加60[i] >= 150 * 10000 },
                        { name: '折返程度', value: type === '摸顶' ? (价格_最高15[i] - 价格[i]) < 折返率[i] : (价格[i] - 价格_最低15[i]) < 折返率[i] },
                        { name: '价格速度', value: 价差[i] > 价差中大分界 || 价格差_除以时间[i] >= 0.1 },
                        { name: '价差 >=6', value: 价差[i] >= 6 },
                        { name: 'is趋势', value: bs.is趋势[i] },
                        { name: '波动率最大限制', value: 价差[i] < 价差大巨大分界 },
                    ]
                }
            )
        }
        const 信号_摸顶 = 摸顶抄底('摸顶')
        const 信号_抄底 = 摸顶抄底('抄底')


        const 摸顶抄底_平仓 = (type: '摸顶' | '抄底') => 指标.lazyMapCache(
            () => Math.min(
                data.length,
                orderBook.length,
            ),
            i => [
                { name: '成交量 DIF < DEM', value: 净成交量abs_macd.DIF[i] < 净成交量abs_macd.DEM[i] },
                { name: '折返程度', value: type === '摸顶' ? (价格_最高15[i] - 价格[i]) > 折返率[i] : (价格[i] - 价格_最低15[i]) > 折返率[i] },
            ]
        )
        const 信号_摸顶_下跌平仓 = 摸顶抄底_平仓('摸顶')
        const 信号_抄底_上涨平仓 = 摸顶抄底_平仓('抄底')


        const 追涨_追跌 = (type: '追涨' | '追跌') => {
            const bs = type === '追涨' ? 买 : 卖
            const 价差 = type === '追涨' ? 上涨_价差 : 下跌_价差
            return 指标.lazyMapCache(
                () => Math.min(
                    data.length,
                    orderBook.length,
                ),
                i => [
                    { name: '净盘口 > 0', value: bs.净盘口[i] > 0 },
                    { name: '相对价差 ', value: type === '追涨' ? bitmex_hopex_相对价差[i] > 0 : bitmex_hopex_相对价差[i] < 0 },
                    { name: '5分钟波动率低量', value: 价格_波动率300[i] < 30 },
                    { name: '大单', value: bs.净成交量_累加5[i] > 100 * 10000 },
                    { name: '价差 < 4', value: 价差[i] <= 4 },
                    { name: '折返程度', value: type === '追涨' ? (价格_最高15[i] - 价格[i]) < 折返率[i] : (价格[i] - 价格_最低15[i]) < 折返率[i] },
                    { name: 'is趋势', value: bs.is趋势[i] },
                ]
            )
        }
        const 信号_追涨 = 追涨_追跌('追涨')
        const 信号_追跌 = 追涨_追跌('追跌')



        return {
            bitmex_hopex_差价,
            bitmex_hopex_相对价差,
            bitmex_hopex_差价均线,
            bitmex_hopex_差价macd,
            买,
            卖,
            震荡指数_macd,
            震荡指数,
            收盘价,
            盘口: orderBook,
            时间,
            价格_波动率300,
            折返率,
            信号_摸顶_下跌平仓,
            信号_抄底_上涨平仓,
            价格差_除以时间,
            上涨_下跌,
            价格_均线300,
            净成交量abs_macd,
            上涨,
            上涨_价差,
            下跌,
            价格,
            价格_波动率30,
            阻力3涨,
            阻力3跌,
            真空信号涨,
            真空信号跌,
            信号_摸顶,
            信号_追涨,
            信号_抄底,
            信号_追跌,
            价格_最高15,
            价格_最低15,
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
            () => Math.min(期货.信号_抄底.length, 期货.价格.length, 期货.价格_波动率30.length, hopex.价格.length),
            i => [
                { name: '5秒内信号', value: _5秒内有全亮(期货.信号_抄底, i) },
                { name: '期货.波动率[i] >10 ', value: 期货.价格_波动率30[i] > 10 },
                { name: 'bm折返 >', value: 期货.价格[i] - 期货.价格_最低15[i] > 期货.折返率[i] },
                { name: 'hp折返 <', value: hopex.价格[i] - hopex.价格_最低15[i] < 期货.折返率[i] / 2 },
            ]
        )

        const 信号hopex_上涨 = 指标.lazyMapCache(
            () => Math.min(期货.信号_摸顶.length, 期货.价格.length, 期货.价格_波动率30.length, hopex.价格.length),
            i => [
                { name: '5秒内信号', value: _5秒内有全亮(期货.信号_摸顶, i) },
                { name: '期货.波动率[i] >10 ', value: 期货.价格_波动率30[i] > 10 },
                { name: 'bm折返 >', value: 期货.价格_最高15[i] - 期货.价格[i] > 期货.折返率[i] },
                { name: 'hp折返 <', value: hopex.价格_最高15[i] - hopex.价格[i] < 期货.折返率[i] / 2 },
            ]
        )


        return {
            // bitmex_hopex_相对价差,
            bitmex_hopex_差价,
            //bitmex_hopex_差价均线,
            //bitmex_hopex_差价macd,

            信号hopex_下跌,
            信号hopex_上涨,
            现货减去: 0,
            //现货
            现货,
            现货减去价格: 现货.价格,
            现货减去价格均线: 现货.价格_均线300,
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
                v.现货减去价格均线 = 指标.lazyMapCache(() => v.现货.价格_均线300.length, i => v.现货.价格_均线300[i] - n)
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
        const 摸顶 = realData.dataExt[symbol].期货.信号_摸顶
        const 抄底 = realData.dataExt[symbol].期货.信号_抄底
        const 追涨 = realData.dataExt[symbol].期货.信号_追涨
        const 追跌 = realData.dataExt[symbol].期货.信号_追跌

        return JSON.stringify({
            上涨: 摸顶.length > 3 ? [摸顶[摸顶.length - 3], 摸顶[摸顶.length - 2], 摸顶[摸顶.length - 1]] : '',
            下跌: 抄底.length > 3 ? [抄底[抄底.length - 3], 抄底[抄底.length - 2], 抄底[抄底.length - 1]] : '',
            追涨: 追涨.length > 3 ? [追涨[追涨.length - 3], 追涨[追涨.length - 2], 追涨[追涨.length - 1]] : '',
            追跌: 追跌.length > 3 ? [追跌[追跌.length - 3], 追跌[追跌.length - 2], 追跌[追跌.length - 1]] : '',
            波动率: lastNumber(realData.dataExt[symbol].期货.价格_波动率30),
        })
    }




    摸顶抄底信号灯side___2根 = (symbol: BaseType.BitmexSymbol) => {
        const realData = this
        const up = realData.dataExt[symbol].期货.信号_摸顶
        const down = realData.dataExt[symbol].期货.信号_抄底

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
        if (is连续几根全亮(3, realData.dataExt[symbol].期货.信号_摸顶)) {
            return '摸顶'
        }
        else if (is连续几根全亮(3, realData.dataExt[symbol].期货.信号_抄底)) {
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
        const 上涨做空下跌平仓 = this.dataExt[symbol].期货.信号_摸顶_下跌平仓
        const 下跌抄底上涨平仓 = this.dataExt[symbol].期货.信号_抄底_上涨平仓

        return JSON.stringify({
            上涨做空下跌平仓: 上涨做空下跌平仓.length > 3 ? [上涨做空下跌平仓[上涨做空下跌平仓.length - 3], 上涨做空下跌平仓[上涨做空下跌平仓.length - 2], 上涨做空下跌平仓[上涨做空下跌平仓.length - 1]] : '',
            下跌抄底上涨平仓: 下跌抄底上涨平仓.length > 3 ? [下跌抄底上涨平仓[下跌抄底上涨平仓.length - 3], 下跌抄底上涨平仓[下跌抄底上涨平仓.length - 2], 下跌抄底上涨平仓[下跌抄底上涨平仓.length - 1]] : '',
        })
    }


    is摸顶_下跌平仓 = (symbol: BaseType.BitmexSymbol) =>
        is连续几根全亮(2, this.dataExt[symbol].期货.信号_摸顶_下跌平仓)

    is抄底_上涨平仓 = (symbol: BaseType.BitmexSymbol) =>
        is连续几根全亮(2, this.dataExt[symbol].期货.信号_抄底_上涨平仓)


    get波动率 = (symbol: BaseType.BitmexSymbol) =>
        lastNumber(this.dataExt[symbol].期货.价格_波动率30)





}