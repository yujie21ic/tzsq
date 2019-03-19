import { JSONSync } from '../lib/C/JSONSync'
import { BaseType } from '../lib/BaseType'
import { sum } from 'ramda'
import { 指标 } from '../指标/指标'
import { to范围 } from '../lib/F/to范围'
import { lastNumber } from '../lib/F/lastNumber'
import { is连续几根全亮 } from '../lib/F/is连续几根全亮'
import { timeID } from '../lib/F/timeID'
import { 买卖 } from '../指标/买卖'



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
            ctp: {
                rb1905: {
                    data: [] as BaseType.KLine[],
                    orderBook: [] as BaseType.OrderBook[],
                }
            },
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






    private item2({ data, orderBook }: {
        data: BaseType.KLine[]
        orderBook: BaseType.OrderBook[]
    }, 盘口算价格: boolean) {

        盘口算价格 = false

        const 价格 = 盘口算价格 ?
            指标.lazyMapCache(() => orderBook.length, i =>
                (orderBook[i].buy && orderBook[i].buy.length > 0 && orderBook[i].sell && orderBook[i].sell.length > 0) ?
                    ((orderBook[i].buy[0].price + orderBook[i].sell[0].price) / 2) : NaN) :
            指标.lazyMapCache(() => data.length, i => {
                const x = data[i]
                if (x === undefined) {
                    console.log('xxx', data.length, i)
                    if (isNaN(i)) debugger
                }
                return x.close
            })


        const KLine = 指标.lazyMapCache(() => data.length, i => ({
            open: data[i].open,
            high: data[i].high,
            low: data[i].low,
            close: data[i].close,
        }))


        const 收盘价 = 指标.lazyMapCache(() => data.length, i => data[i].close)

        const 时间 = 指标.lazyMapCache(() => data.length, i => timeID._500msIDToTimestamp(data[i].id))
        const __成交量买 = 指标.lazyMapCache(() => data.length, i => data[i].buySize)
        const __成交量卖 = 指标.lazyMapCache(() => data.length, i => data[i].sellSize)
        const __盘口买 = 指标.lazyMapCache(() => orderBook.length, i => sum(orderBook[i].buy.map(v => v.size)))
        const __盘口卖 = 指标.lazyMapCache(() => orderBook.length, i => sum(orderBook[i].sell.map(v => v.size)))

        const 买 = 买卖({
            成交量: __成交量买,
            盘口: __盘口买,
            反向成交量: __成交量卖,
            反向盘口: __盘口卖,
        })

        const 卖 = 买卖({
            成交量: __成交量卖,
            盘口: __盘口卖,
            反向成交量: __成交量买,
            反向盘口: __盘口买,
        })


        //价格
        const 价格_均线300 = 指标.均线(价格, 300, RealDataBase.单位时间)


        const 价格_波动率15 = 指标.波动率(价格, 15, RealDataBase.单位时间)
        const 价格_波动率30 = 指标.波动率(价格, 30, RealDataBase.单位时间)
        const 价格_波动率60 = 指标.波动率(价格, 60, RealDataBase.单位时间)
        const 价格_波动率300 = 指标.波动率(价格, 300, RealDataBase.单位时间)



        const 折返率 = 指标.lazyMapCache(() => 价格_波动率30.length, i => to范围({ min: 4, max: 15, value: 价格_波动率30[i] / 10 }))

        //净成交量abs
        const 净成交量abs = 指标.lazyMapCache(() => Math.min(买.成交量.length, 卖.成交量.length), i => 买.成交量[i] - 卖.成交量[i])
        const 净成交量abs原始 = 指标.lazyMapCache(() => Math.min(买.成交量.length, 卖.成交量.length), i => Math.abs(买.成交量[i] - 卖.成交量[i]))

        const 净成交量abs_累加5 = 指标.累加(净成交量abs, 5, RealDataBase.单位时间)
        const 净成交量abs_macd = 指标.macd(净成交量abs原始, RealDataBase.单位时间)

        //阻力3
        const __阻力3 = 指标.阻力3({ price: 价格, volumeBuy: 买.成交量, volumeSell: 卖.成交量, })
        const 阻力3涨 = 指标.lazyMapCache(() => __阻力3.length, i => Math.max(0, __阻力3[i].阻力))
        const 阻力3跌 = 指标.lazyMapCache(() => __阻力3.length, i => Math.min(0, __阻力3[i].阻力))
        const 真空信号涨 = 指标.lazyMapCache(() => 价格.length, i => (__阻力3[i].阻力 < 150000) && __阻力3[i].阻力 > 0 && __阻力3[i].价钱增量 >= to范围({ min: 4, max: 12, value: 价格_波动率30[i] / 10 }))
        const 真空信号跌 = 指标.lazyMapCache(() => 价格.length, i => (__阻力3[i].阻力 > -150000) && __阻力3[i].阻力 < 0 && __阻力3[i].价钱增量 >= to范围({ min: 4, max: 12, value: 价格_波动率30[i] / 10 }))

        //上涨_下跌
        //const 上涨_下跌 = 指标.lazyMapCache(() => Math.min(买.净成交量_累加60.length), i => 买.净成交量_累加60[i] >= 0 ? '上涨' : '下跌')
        const 上涨_下跌_横盘 = 指标.lazyMapCache(
            () => Math.min(买.净成交量_累加60.length),
            i => {
                if (买.净成交量_累加60[i] >= 50 * 10000) {
                    return '上涨'
                } else if (买.净成交量_累加60[i] <= -50 * 10000) {
                    return '下跌'
                } else {
                    return '横盘'
                }
            })

        //
        const 价格_最高60 = 指标.最高(价格, 60, RealDataBase.单位时间)
        const 价格_最低60 = 指标.最低(价格, 60, RealDataBase.单位时间)



        //________________上涨_下跌_分开_的 全用这个 返回______________________
        //引用 统一 上涨.xxx 下跌.xxx


        const 上涨_下跌_分开_的 = (type: '上涨' | '下跌') => {

            const 累计成交量 = 指标.lazyMapCache2({ 累计成交量: NaN }, (arr: number[], ext) => {
                const length = Math.min(上涨_下跌_横盘.length, 买.成交量.length, 卖.成交量.length)
                for (let i = Math.max(0, arr.length - 1); i < length; i++) {
                    if (上涨_下跌_横盘[i] === type) {
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

            const 价差 = 指标.lazyMapCache2({ 起点价格: NaN }, (arr: number[], ext) => {
                const length = Math.min(上涨_下跌_横盘.length, 价格_最高60.length, 价格_最低60.length)
                for (let i = Math.max(0, arr.length - 1); i < length; i++) {//最高价10 最低价10 一样长
                    if (上涨_下跌_横盘[i] === type) {
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
                        arr[i] = 价格_最高60[i] - ext.起点价格
                    }
                    else if (type === '下跌') {
                        arr[i] = ext.起点价格 - 价格_最低60[i]
                    }
                }
            })

            const 动力 = 指标.lazyMapCache(
                () => Math.min(累计成交量.length, 价差.length),
                i => to范围({ min: 30 * 10000, max: 130 * 10000, value: 累计成交量[i] / Math.max(1, 价差[i]) }) //最小除以1
            )


            const 动态时间_x秒 = 指标.lazyMapCache(
                () => Math.min(价差.length),
                i => to范围({ min: 15, max: 20, value: 价差[i] / 10 }),
            )

            const 动态时间_y秒 = 指标.lazyMapCache(
                () => Math.min(价差.length),
                i => to范围({ min: 4, max: 20, value: 价差[i] / 12 }),
            )

            const 动态时间_y秒大 = 指标.lazyMapCache(
                () => Math.min(价差.length),
                i => to范围({ min: 7, max: 25, value: 价差[i] / 6 }),
            )

            const x秒内极值点价格 = 指标.lazyMapCache(
                () => Math.min(动态时间_x秒.length, 价格.length),
                i => {

                    //1秒2根
                    const x根 = 动态时间_x秒[i] * 2

                    let 极值点 = 价格[i]

                    for (let k = i; k > Math.max(-1, i - x根); k--) {
                        极值点 = (type === '上涨' ? Math.max : Math.min)(极值点, 价格[k])
                    }

                    return 极值点
                }
            )
            // const x秒内极值点价格 = type === '上涨' ?指标.最高(价格, lastNumber(动态时间_x秒), RealDataBase.单位时间):指标.最低(价格, lastNumber(动态时间_x秒), RealDataBase.单位时间)


            //y秒
            const 价差走平 = 指标.lazyMapCache(
                () => Math.min(动态时间_y秒.length, 价格.length, x秒内极值点价格.length),
                i => {
                    //1秒2根
                    const y根 = 动态时间_y秒[i] * 2
                    if (isNaN(y根)) return false
                    const 极值 = x秒内极值点价格[Math.max(0, i - y根 + 1)]
                    for (let k = i; k > Math.max(-1, i - y根); k--) {
                        if (type === '上涨' && 价格[k] > (极值 + (价差[i] > 50 ? 2 : 0))) {//继续创新高
                            return false
                        }

                        if (type === '下跌' && 价格[k] < (极值 - (价差[i] > 50 ? 2 : 0))) {//继续创新低
                            return false
                        }
                    }
                    return true
                }
            )
            const 价差走平4s = 指标.lazyMapCache(
                () => Math.min(价格.length, x秒内极值点价格.length),
                i => {
                    //1秒2根
                    const y根 = 4 * 2
                    if (isNaN(y根)) return false
                    const 极值 = x秒内极值点价格[Math.max(0, i - y根 + 1)]
                    for (let k = i; k > Math.max(-1, i - y根); k--) {
                        if (type === '上涨' && 价格[k] > 极值) {//继续创新高
                            return false
                        }

                        if (type === '下跌' && 价格[k] < 极值) {//继续创新低
                            return false
                        }
                    }
                    return true
                }
            )
            // const 当前价格与极值关系 = 指标.lazyMapCache(
            //     () => Math.min(价格.length, 价格_最高15.length, 价格_最低15.length),
            //     i => {
            //         // if (type === '上涨' && 价格[i] - 价格_最高15[i]<=0) {
            //         //     return true
            //         // }else{
            //         // if (type === '下跌' && ) {
            //         //     return true
            //         // }
            //         return 价格[i] - 价格_最低15[i] >= 0
            //         //}
            //         //return false
            //     }
            // )
            const 价差走平大 = 指标.lazyMapCache(
                () => Math.min(动态时间_y秒大.length, 价格.length, x秒内极值点价格.length),
                i => {
                    //1秒2根
                    const y根 = 动态时间_y秒大[i] * 2
                    if (isNaN(y根)) return false
                    const 极值 = x秒内极值点价格[Math.max(0, i - y根 + 1)]
                    for (let k = i; k > Math.max(-1, i - y根); k--) {
                        if (type === '上涨' && 价格[k] > (极值 + (价差[i] > 50 ? 2 : 0))) {//继续创新高
                            return false
                        }

                        if (type === '下跌' && 价格[k] < (极值 - (价差[i] > 50 ? 2 : 0))) {//继续创新低
                            return false
                        }
                    }
                    return true
                }
            )



            const 震荡指数 = 指标.lazyMapCache(
                () => Math.min(价差.length, 价格_波动率15.length),
                i => 价差[i] > 2 ? to范围({ min: 0.01, max: 10, value: 价格_波动率15[i] / 价差[i] }) : NaN
            )


            const 震荡指数_最高30 = 指标.lazyMapCache(
                () => Math.min(价差.length, 价格_波动率15.length),
                i => {
                    let 最高 = 震荡指数[i]

                    for (let k = i; k > Math.max(-1, k - 30 * 2); k--) {
                        const v = 震荡指数[k]
                        if (isNaN(v)) {
                            break
                        } else {
                            最高 = Math.max(最高, v)
                        }
                    }

                    return 最高
                }
            )



            return {
                累计成交量,
                价差,
                动力,
                //动力波动率: __波动率(动力),
                动态时间_x秒,
                动态时间_y秒,
                x秒内极值点价格,
                价差走平,
                价差走平大,
                价差走平4s,
                // 当前价格与极值关系,

                震荡指数,
                震荡指数_最高30,
            }
        }


        const 上涨 = 上涨_下跌_分开_的('上涨')
        const 下跌 = 上涨_下跌_分开_的('下跌')



        //起点  结束 点  要专门 封装起来！！！！！！！！！！！
        //________________________________________________FFFFFFFFFFFFFFFFFFFFFFF________________________________________________
        const 价格差_除以时间 = 指标.lazyMapCache2({ 起点index: NaN, 起点Type: 'none' as '上涨' | '下跌' }, (arr: number[], ext) => {
            const length = Math.min(上涨_下跌_横盘.length, 上涨.价差.length, 下跌.价差.length)

            let 上涨下跌价差 = (xx: '上涨' | '下跌') => xx === '上涨' ? 上涨.价差 : 下跌.价差 //每个地方都不同！！！！


            for (let i = Math.max(0, arr.length - 1); i < length; i++) {
                //开始
                if (isNaN(ext.起点index) || ext.起点index === length - 1) {   //最后一个重新计算  
                    const xxxxxxxxxxx = 上涨_下跌_横盘[i]
                    if (xxxxxxxxxxx !== '横盘' && 上涨下跌价差(xxxxxxxxxxx)[i] >= 2) { //<---------------------------------------------------
                        ext.起点index = i
                        ext.起点Type = xxxxxxxxxxx
                    }
                }
                //结束
                else {
                    if (上涨下跌价差(ext.起点Type)[i] >= 200 || 上涨_下跌_横盘[i] !== ext.起点Type) { //<---------------------------------------------------
                        ext.起点index = NaN
                    }
                }


                let a = i - ext.起点index
                if (a === 0) a = NaN
                if (a >= 120) a = 120
                arr[i] = isNaN(ext.起点index) === false && 上涨下跌价差(ext.起点Type)[i] >= 4 ? to范围({ min: 0.01, max: 10, value: 上涨下跌价差(ext.起点Type)[i] / a }) : NaN  //除以根数 
                //<---------------------------------------------------
            }
        })






        const 价格速度_macd = 指标.macd(价格差_除以时间, RealDataBase.单位时间)

        const 震荡指数 = 指标.lazyMapCache(() => Math.min(上涨.价差.length, 下跌.价差.length, 上涨_下跌_横盘.length, 价格_波动率30.length), i => {
            const 上涨下跌价差 = (上涨_下跌_横盘[i] === '上涨' ? 上涨.价差 : 下跌.价差)[i]
            return 上涨下跌价差 > 2 ? to范围({ min: 0.01, max: 10, value: 价格_波动率15[i] / 上涨下跌价差 }) : NaN
        })

        const 震荡指数_macd = 指标.macd(震荡指数, RealDataBase.单位时间)

        const 动态价格秒数 = 指标.lazyMapCache(
            () => Math.min(价格.length, 上涨.价差.length, 下跌.价差.length),
            i => to范围({ min: 15, max: 25, value: ((上涨_下跌_横盘[i] === '上涨' ? 上涨.价差 : 下跌.价差)[i] / 5) }) ,
        )
        const 动态价格_均线 = 指标.均线(价格, 7, RealDataBase.单位时间)
        const 动态价格_均线方差 = 指标.lazyMapCache(() => Math.min(动态价格_均线.length, 价格.length), i => {
            let sum = 0
            for (let n = (价格.length - 动态价格秒数[i] * 2); n < 价格.length; n++) {
                sum = sum + Math.pow((价格[n] - 动态价格_均线[i]), 2)
            }
            let 方差 = Math.sqrt(sum / (7 * 2))
            return 方差
        })
        const 动态价格_均线方差macd = 指标.macd(动态价格_均线方差, RealDataBase.单位时间)



        const 绝对价差 = 指标.lazyMapCache(() => Math.min(上涨.价差.length, 下跌.价差.length, 上涨_下跌_横盘.length), i => 上涨_下跌_横盘[i] === '上涨' ? 上涨.价差[i] : 下跌.价差[i])
        //_______________________________________________________________________________________________________________________________//




        //这些 不用放 上涨 下跌 那个里面   临时不要动
        //const bitmex_hopex_差价: ArrayLike<number> = (指标.lazyMapCache(() => this.dataExt.XBTUSD.bitmex_hopex_差价.length, i => this.dataExt.XBTUSD.bitmex_hopex_差价[i])) as any
        const bitmex_hopex_上涨差价: ArrayLike<number> = (指标.lazyMapCache(() => this.dataExt.XBTUSD.bitmex_hopex_上涨差价.length, i => this.dataExt.XBTUSD.bitmex_hopex_上涨差价[i])) as any
        const bitmex_hopex_下跌差价: ArrayLike<number> = (指标.lazyMapCache(() => this.dataExt.XBTUSD.bitmex_hopex_下跌差价.length, i => this.dataExt.XBTUSD.bitmex_hopex_下跌差价[i])) as any

        const bitmex_hopex_上涨差价均线 = 指标.均线(bitmex_hopex_上涨差价, 180, RealDataBase.单位时间)
        const bitmex_hopex_下跌差价均线 = 指标.均线(bitmex_hopex_下跌差价, 180, RealDataBase.单位时间)

        const bitmex_hopex_上涨相对价差 = 指标.lazyMapCache(() => Math.min(bitmex_hopex_上涨差价.length, bitmex_hopex_上涨差价均线.length), i => bitmex_hopex_上涨差价[i] - bitmex_hopex_上涨差价均线[i])
        const bitmex_hopex_下跌相对价差 = 指标.lazyMapCache(() => Math.min(bitmex_hopex_下跌差价.length, bitmex_hopex_下跌差价均线.length), i => bitmex_hopex_下跌差价[i] - bitmex_hopex_下跌差价均线[i])

        const bitmex_hopex_上涨相对差价均线 = 指标.均线(bitmex_hopex_上涨相对价差, 10, RealDataBase.单位时间)
        const bitmex_hopex_下跌相对价差均线 = 指标.均线(bitmex_hopex_下跌相对价差, 10, RealDataBase.单位时间)

        const bitmex_hopex_上涨相对差价macd = 指标.macd(bitmex_hopex_上涨相对价差, RealDataBase.单位时间)
        const bitmex_hopex_下跌相对差价macd = 指标.macd(bitmex_hopex_下跌相对价差, RealDataBase.单位时间)
        //








        //????????????????
        const 累计成交量阈值 = 指标.lazyMapCache(() => Math.min(上涨.价差.length, 下跌.价差.length, 上涨_下跌_横盘.length), i => 上涨_下跌_横盘[i] === '上涨' ? 75 * 10000 * 上涨.价差[i] + 300 * 10000 : 62 * 10000 * 下跌.价差[i] + 300 * 10000)
        const 实时成交量 = 指标.lazyMapCache(() => Math.min(上涨.累计成交量.length, 下跌.累计成交量.length, 上涨_下跌_横盘.length), i => 上涨_下跌_横盘[i] === '上涨' ? 上涨.累计成交量[i] : 下跌.累计成交量[i])
        const 实时与标准成交量之差 = 指标.lazyMapCache(() => Math.min(累计成交量阈值.length, 实时成交量.length), i => (实时成交量[i] - 累计成交量阈值[i]))
        const 实时与标准成交量之差macd = 指标.macd(实时与标准成交量之差, RealDataBase.单位时间)

        const 价差中大分界 = 20
        const 价差大巨大分界 = 50

        const __摸顶抄底 = (type: '摸顶' | '抄底') => {
            const bs = type === '摸顶' ? 买 : 卖
            const 价差 = type === '摸顶' ? 上涨.价差 : 下跌.价差
            const 真空信号 = type === '摸顶' ? 真空信号涨 : 真空信号跌
            const 净累计成交量 = type === '摸顶' ? 上涨.累计成交量 : 下跌.累计成交量


            return 指标.lazyMapCache(
                () => Math.min(
                    data.length,
                    orderBook.length,


                    //_____________________fix______________________________________
                    价格差_除以时间.length,//!!!


                    上涨.累计成交量.length,
                    下跌.累计成交量.length,
                    累计成交量阈值.length,
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
                    // const A = bs.净盘口[i] <= bs.净盘口_均线5[i] + 50 * 10000 && bs.净盘口[i] < 5 * 100000
                    // const B = bs.净盘口[i] <= bs.净盘口_均线5[i] && bs.净盘口[i] < 0
                    const A = bs.净盘口[i] < 5 * 100000
                    const B = bs.净盘口[i] < 0
                    let 盘口通用 =
                        (小 && 盘口_0_100万 && A) ||
                        (小 && 盘口_100_150万 && B) ||
                        (大 && 盘口_0_200万 && 真空信号[i]) ||
                        (大 && 盘口_0_50万 && A) ||
                        (大 && 盘口_50_100万 && B)



                    //成交量衰竭
                    //const v__0 = 净成交量abs_macd.DIF[i] < 0
                    const v__0 = true
                    const v__1 = 净成交量abs_macd.DIF[i] < 净成交量abs_macd.DEM[i]
                    const v__1_1 = 净成交量abs_macd.DIF[i] < 净成交量abs_macd.DEM[i] * 1.1
                    //const 净累计成交量阈值 = type === '摸顶' ?65*10000*价差[i]+200*10000:60*10000*价差[i]+300*10000

                    const 净成交量5反向 = type === '摸顶' ? 净成交量abs_累加5[i] < 0 : 净成交量abs_累加5[i] > 0
                    const 成交量衰竭 =
                        (v__1_1 && bs.净成交量_累加5[i] < 50 * 10000) ||
                        (小 && v__1) ||
                        (大 && v__0 && v__1)

                    const 震荡指数_最高30 = type === '摸顶' ? 上涨.震荡指数_最高30[i] : 下跌.震荡指数_最高30[i]
                    const 震荡 = 震荡指数_最高30 > 1.1 && (震荡指数[i] < 2 && (震荡指数[i] < 1.1 || 震荡指数_macd.DIF[i] < 震荡指数_macd.DEM[i]))

                    const 价差走平 = type === '摸顶' ? 上涨.价差走平[i] : 下跌.价差走平[i]
                    const 价差走平大 = type === '摸顶' ? 上涨.价差走平大[i] : 下跌.价差走平大[i]

                    let 大价差走平x秒 = 价差[i] > 价差大巨大分界 && 价差走平大
                    let 标准成交量差值衰竭 = false
                    let 盘口 = false
                    let 成交量 = false
                    let 形态 = false
                    let 标准成交量 = false
                    let 价格速度 = false
                    if (价差[i] < 价差中大分界) {
                        形态 = 震荡 || 价差走平
                        成交量 = 成交量衰竭 || 净成交量5反向
                        盘口 = 盘口通用
                        标准成交量差值衰竭 = (实时与标准成交量之差macd.DIF[i] < 实时与标准成交量之差macd.DEM[i])
                        标准成交量 = 净累计成交量[i] < 累计成交量阈值[i]
                        价格速度 = 价格差_除以时间[i] >= 0.1
                    } else if (价差[i] > 价差中大分界 && 价差[i] < 价差大巨大分界) {
                        形态 = 震荡 || 价差走平
                        成交量 = 成交量衰竭 || 净成交量5反向
                        盘口 = 盘口通用
                        标准成交量差值衰竭 = (实时与标准成交量之差macd.DIF[i] < 实时与标准成交量之差macd.DEM[i]) || (实时与标准成交量之差[i] < -200 * 10000)
                        标准成交量 = 净累计成交量[i] < 累计成交量阈值[i]
                        价格速度 = 价格差_除以时间[i] >= 0.1
                    } else if (价差[i] > 价差大巨大分界) {
                        形态 = 价差走平
                        成交量 = 成交量衰竭 || 净成交量5反向 || 大价差走平x秒
                        盘口 = bs.净盘口_均线5[i] < 0 || 大价差走平x秒
                        标准成交量差值衰竭 = (实时与标准成交量之差macd.DIF[i] < 实时与标准成交量之差macd.DEM[i]) || (实时与标准成交量之差[i] < -200 * 10000) || 大价差走平x秒
                        标准成交量 = 净累计成交量[i] < 累计成交量阈值[i] || 大价差走平x秒
                        价格速度 = true
                    }

                    return [
                        //局部精确信号
                        { name: '成交量', value: 成交量 },
                        { name: '盘口', value: 盘口 },
                        //范围信号  
                        { name: '形态', value: 形态 },
                        { name: '标准成交量差值衰竭', value: 标准成交量差值衰竭 || 价格_波动率30[i] < 250 },
                        //{ name: '实时与标准成交量之差', value: },
                        // { name: '价差走平', value: 价差走平 },
                        //{ name: '大价差走平x秒', value: 价差走平大 },
                        //{ name: '价差走平4s', value: 下跌.价差走平4s[i] },
                        //{ name: '当前价格与极值关系', value: 下跌.当前价格与极值关系[i] },

                        // //过滤条件
                        { name: '标准成交量', value: 标准成交量 || 价格_波动率30[i] < 250 },
                        { name: '60秒净买成交量 >= 150万', value: bs.净成交量_累加60[i] >= 200 * 10000 },
                        { name: '折返程度', value: type === '摸顶' ? (价格_最高60[i] - 价格[i]) < 折返率[i] : (价格[i] - 价格_最低60[i]) < 折返率[i] },
                        { name: '价格速度', value: 价格速度 },
                        { name: '价差 >=8', value: 价差[i] >= 8 },
                        { name: 'is趋势', value: type === '摸顶' ? 上涨_下跌_横盘[i] === '上涨' : 上涨_下跌_横盘[i] === '下跌' },
                        { name: '波动率最大限制', value: 价格_波动率30[i] < 150 },
                    ]
                }
            )
        }
        const 信号_摸顶 = __摸顶抄底('摸顶')
        const 信号_抄底 = __摸顶抄底('抄底')


        const __摸顶抄底_平仓 = (type: '摸顶' | '抄底') => 指标.lazyMapCache(
            () => Math.min(
                data.length,
                orderBook.length,
            ),
            i => [
                { name: '震荡指数_macd DIF < DEM', value: 震荡指数_macd.DIF[i] < 震荡指数_macd.DEM[i] },
                { name: '成交量 DIF < DEM', value: 净成交量abs_macd.DIF[i] < 净成交量abs_macd.DEM[i] },
                { name: '折返程度', value: type === '摸顶' ? (价格_最高60[i] - 价格[i]) > 折返率[i] : (价格[i] - 价格_最低60[i]) > 折返率[i] },
            ]
        )
        const 信号_摸顶_下跌平仓 = __摸顶抄底_平仓('摸顶')
        const 信号_抄底_上涨平仓 = __摸顶抄底_平仓('抄底')


        const __追涨_追跌 = (type: '追涨' | '追跌') => {
            const bs = type === '追涨' ? 买 : 卖
            const 价差 = type === '追涨' ? 上涨.价差 : 下跌.价差
            return 指标.lazyMapCache(
                () => Math.min(
                    data.length,
                    orderBook.length,
                    bitmex_hopex_上涨相对价差.length,//<----------------------------
                    bitmex_hopex_下跌相对价差.length,
                ),
                i => [
                    { name: '净盘口 > 0', value: bs.净盘口_均线5[i] > 0 },
                    { name: '相对价差 ', value: type === '追涨' ? bitmex_hopex_上涨相对差价均线[i] > 0 : bitmex_hopex_下跌相对价差均线[i] < 0 },
                    { name: '5分钟波动率低量', value: 价格_波动率300[i] < 30 },
                    { name: '大单', value: bs.净成交量_累加10[i] > 100 * 10000 },
                    { name: '价差 < 4', value: 价差[i] <= 4 || (价格差_除以时间[i] <= 0.04 ? 价差[i] <= 8 : false) },
                    { name: '折返程度', value: type === '追涨' ? (价格_最高60[i] - 价格[i]) < 折返率[i] : (价格[i] - 价格_最低60[i]) < 折返率[i] },
                    { name: 'is趋势', value: type === '追涨' ? 上涨_下跌_横盘[i] === '上涨' : 上涨_下跌_横盘[i] === '下跌' },
                ]
            )
        }
        const 信号_追涨 = __追涨_追跌('追涨')
        const 信号_追跌 = __追涨_追跌('追跌')

        const [双开, 双平, 多换, 空换, 多平, 空平, 空开, 多开] = ['双开', '双平', '多换', '空换', '多平', '空平', '空开', '多开'].map(v =>
            指标.lazyMapCache(() => data.length, i => data[i].成交性质 === v ? data[i].buySize + data[i].sellSize : 0)
        )

        return {
            价格_波动率60,
            动态价格_均线方差macd,
            动态价格_均线方差,
            动态价格_均线,
            实时与标准成交量之差macd,
            实时与标准成交量之差,
            价格速度macd: 价格速度_macd,
            累计成交量阈值,
            双开, 双平, 多换, 空换, 多平, 空平, 空开, 多开,
            KLine,
            净成交量均线10: 净成交量abs_累加5,
            绝对价差,
            bitmex_hopex_上涨相对差价均线,
            bitmex_hopex_下跌相对价差均线,
            bitmex_hopex_上涨差价,
            bitmex_hopex_上涨相对价差,
            bitmex_hopex_上涨差价均线,
            bitmex_hopex_上涨相对差价macd,
            bitmex_hopex_下跌差价,
            bitmex_hopex_下跌相对价差,
            bitmex_hopex_下跌差价均线,
            bitmex_hopex_下跌相对差价macd,
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
            上涨_下跌: 上涨_下跌_横盘,
            价格_均线300,
            净成交量abs_macd,
            上涨,
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
            价格_最高15: 价格_最高60,
            价格_最低15: 价格_最低60,
        }
    }


    private item = (symbol: BaseType.BitmexSymbol, binanceSymbol: BaseType.BinanceSymbol, hopexSymbol: BaseType.HopexSymbol) => {

        const 现货 = this.item2(this.data.binance[binanceSymbol], false)

        const 期货 = this.item2(this.data.bitmex[symbol], true)

        const hopex = this.item2(this.data.hopex[hopexSymbol], false)

        //差价
        const 差价 = 指标.lazyMapCache(() => Math.min(现货.价格.length, 期货.价格.length), i => 现货.价格[i] - 期货.价格[i])
        const 差价均线 = 指标.均线(差价, 300, RealDataBase.单位时间)


        const bitmex_hopex_上涨差价 = 指标.lazyMapCache(() => Math.min(期货.价格_最高15.length, hopex.价格.length), i => Math.abs(期货.价格_最高15[i] - hopex.价格[i]))
        const bitmex_hopex_下跌差价 = 指标.lazyMapCache(() => Math.min(期货.价格_最低15.length, hopex.价格.length), i => Math.abs(期货.价格_最低15[i] - hopex.价格[i]))

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
            //bitmex_hopex_差价,
            bitmex_hopex_下跌差价,
            bitmex_hopex_上涨差价,
            //bitmex_hopex_差价均线,
            //bitmex_hopex_差价macd,

            信号hopex_下跌,
            信号hopex_上涨,
            现货减去: 0,


            //现货
            现货,
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
        ctp: this.item2(this.data.ctp.rb1905, true),
    }

    重新初始化 = () => {
        this.dataExt = {
            XBTUSD: this.item('XBTUSD', 'btcusdt', 'BTCUSDT'),
            ETHUSD: this.item('ETHUSD', 'ethusdt', 'ETHUSDT'),
            ctp: this.item2(this.data.ctp.rb1905, true),
        }
    }

    set现货减去(n: number) {
        //
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