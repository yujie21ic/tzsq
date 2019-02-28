import { JSONSync } from '../lib/C/JSONSync'
import { BaseType } from '../lib/BaseType'
import { sum } from 'ramda'
import { 指标 } from './指标'
import { kvs } from '../lib/F/kvs'
import { to范围 } from '../lib/F/to范围'



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


        const 多少秒均线 = this.默认期货波动率

        const 价格 = 盘口算价格 ?

            指标.lazyMapCache(() => orderBook.length, i =>
                (orderBook[i].buy && orderBook[i].buy.length > 0 && orderBook[i].sell && orderBook[i].sell.length > 0) ?
                    ((orderBook[i].buy[0].price + orderBook[i].sell[0].price) / 2) : NaN) :

            指标.lazyMapCache(() => data.length, i => data[i].close)


        //和别的时间参数不一样
        const 价格均线 = 指标.均线(价格, 300, RealDataBase.单位时间)

        const 波动率 = 指标.波动率(价格, 30, RealDataBase.单位时间)
        const 波动率5分钟 = 指标.波动率(价格, 60*5, RealDataBase.单位时间)
        const 折返率 = 指标.lazyMapCache(() => 波动率.length, i => 波动率[i] / 10 + 1)



        const 成交量买 = 指标.lazyMapCache(() => data.length, i => Math.abs(data[i].buySize))
        const 成交量卖 = 指标.lazyMapCache(() => data.length, i => Math.abs(data[i].sellSize))
        const 净成交量 = 指标.lazyMapCache(() => data.length, i => 成交量买[i] - 成交量卖[i])


        const 成交量均线买1 = 指标.累加(
            指标.lazyMapCache(() => 成交量买.length, i => 成交量买[i]),
            1,
            RealDataBase.单位时间
        )
        const 成交量均线卖1 = 指标.累加(
            指标.lazyMapCache(() => 成交量卖.length, i => 成交量卖[i]),
            1,
            RealDataBase.单位时间
        )


        const 成交量买均线5 = 指标.累加(
            指标.lazyMapCache(() => 成交量买.length, i => 成交量买[i]),
            5,
            RealDataBase.单位时间
        )
        const 成交量卖均线5 = 指标.累加(
            指标.lazyMapCache(() => 成交量卖.length, i => 成交量卖[i]),
            5,
            RealDataBase.单位时间
        )

        const 成交量买均线30 = 指标.累加(
            指标.lazyMapCache(() => 成交量买.length, i => 成交量买[i]),
            多少秒均线,
            RealDataBase.单位时间
        )
        const 成交量卖均线30 = 指标.累加(
            指标.lazyMapCache(() => 成交量卖.length, i => Math.abs(成交量卖[i])),
            多少秒均线,
            RealDataBase.单位时间
        )
        const 净成交量均线10 = 指标.累加(
            指标.lazyMapCache(() => 成交量卖.length, i => 净成交量[i]),
            10,
            RealDataBase.单位时间
        )

        const 净成交量均线30 = 指标.累加(
            指标.lazyMapCache(() => 成交量卖.length, i => 净成交量[i]),
            多少秒均线,
            RealDataBase.单位时间
        )
        const 净成交量均线60 = 指标.累加(
            指标.lazyMapCache(() => 成交量卖.length, i => 净成交量[i]),
            60,
            RealDataBase.单位时间
        )
        const 净成交量均线120 = 指标.累加(
            指标.lazyMapCache(() => 成交量卖.length, i => 净成交量[i]),
            500,
            RealDataBase.单位时间
        )



        const 盘口买 = 指标.lazyMapCache(() => orderBook.length, i => sum(orderBook[i].buy.map(v => v.size)))
        const 盘口卖 = 指标.lazyMapCache(() => orderBook.length, i => sum(orderBook[i].sell.map(v => v.size)))
        //盘口买1,盘口卖1,净盘口1,净盘口均线1
        //const 盘口买 = 指标.lazyMapCache(() => orderBook.length, i => orderBook[i].buy[0].size)
        //const 盘口卖 = 指标.lazyMapCache(() => orderBook.length, i => orderBook[i].sell[0].size)
        // const 盘口买 = 指标.lazyMapCache(() => orderBook.length, i => orderBook[i].buy.length > 0 ? orderBook[i].buy[0].size : NaN)
        //const 盘口卖 = 指标.lazyMapCache(() => orderBook.length, i => orderBook[i].sell.length > 0 ? orderBook[i].sell[0].size : NaN)

        const 净盘口 = 指标.lazyMapCache(() => Math.min(盘口买.length, 盘口卖.length), i => 盘口买[i] - Math.abs(盘口卖[i]))
        const 净盘口均线 = 指标.均线(
            指标.lazyMapCache(() => Math.min(盘口买.length, 盘口卖.length), i => 净盘口[i]),
            5,
            RealDataBase.单位时间
        )

        // const 净盘口1 = 指标.lazyMapCache(() => Math.min(盘口买1.length, 盘口卖1.length), i => 盘口买1[i] - Math.abs(盘口卖1[i]))
        // const 净盘口均线1 = 指标.均线(
        //     指标.lazyMapCache(() => Math.min(盘口买1.length, 盘口卖1.length), i => 净盘口1[i]),
        //     5,
        //     RealDataBase.单位时间
        // )


        const 阻力3 = 指标.阻力3({
            price: 价格,
            volumeBuy: 成交量买,
            volumeSell: 成交量卖,
        })
        const 阻力3涨 = 指标.lazyMapCache(() => 阻力3.length, i => Math.max(0, 阻力3[i].阻力))
        let 阻力3跌 = 指标.lazyMapCache(() => 阻力3.length, i => Math.min(0, 阻力3[i].阻力))

        const 真空信号涨 = 指标.lazyMapCache(() => 价格.length, i => (阻力3[i].阻力 < 150000) && 阻力3[i].阻力 > 0 && 阻力3[i].价钱增量 >= to范围({ min: 4, max: 12, value: 波动率[i] / 10 }))
        const 真空信号跌 = 指标.lazyMapCache(() => 价格.length, i => (阻力3[i].阻力 > -150000) && 阻力3[i].阻力 < 0 && 阻力3[i].价钱增量 >= to范围({ min: 4, max: 12, value: 波动率[i] / 10 }))

        const 价格均线60 = 指标.均线(价格, 60, RealDataBase.单位时间)

        const 最高价10 = 指标.最高(价格, 15, RealDataBase.单位时间)
        const 最低价10 = 指标.最低(价格, 15, RealDataBase.单位时间)

        const 最高价10index = 指标.最高index(价格, 15, RealDataBase.单位时间)
        const 最低价10index = 指标.最低index(价格, 15, RealDataBase.单位时间)

        const 上涨还是下跌 = 指标.lazyMapCache(
            () => Math.min(最高价10index.length, 最低价10index.length),
            i => 最高价10index[i] > 最低价10index[i] ? '上涨' : '下跌'
        )


        const 自动下单条件 = 指标.lazyMapCache(
            () => Math.min(最高价10.length, 最低价10.length, 波动率.length, 上涨还是下跌.length),
            i =>
                Math.abs(价格[i] - (上涨还是下跌[i] === '上涨' ? 最高价10[i] : 最低价10[i]))
                <=
                to范围({ value: 折返率[i], min: 3, max: 40 })
        )


        const 净下跌成交量 = 指标.lazyMapCache(() => data.length, i => 成交量卖[i] - 成交量买[i])
        const 净上涨成交量 = 指标.lazyMapCache(() => data.length, i => 成交量买[i] - 成交量卖[i])
        const 净下跌成交量30 = 指标.累加(
            指标.lazyMapCache(() => 成交量买.length, i => 净下跌成交量[i]),
            30,
            RealDataBase.单位时间
        )
        const 净上涨成交量30 = 指标.累加(
            指标.lazyMapCache(() => 成交量买.length, i => 净上涨成交量[i]),
            30,
            RealDataBase.单位时间
        )

        const 净下跌成交量12 = 指标.EMA(净下跌成交量, 12, RealDataBase.单位时间)
        const 净下跌成交量26 = 指标.EMA(净下跌成交量, 26, RealDataBase.单位时间)
        const 净下跌成交量DIF = 指标.lazyMapCache(() => Math.min(净下跌成交量12.length, 净下跌成交量26.length), i => 净下跌成交量12[i] - 净下跌成交量26[i])
        const 净下跌成交量DEM = 指标.EMA(净下跌成交量DIF, 9, RealDataBase.单位时间)

        const 净上涨成交量12 = 指标.EMA(净上涨成交量, 12, RealDataBase.单位时间)
        const 净上涨成交量26 = 指标.EMA(净上涨成交量, 26, RealDataBase.单位时间)
        const 净上涨成交量DIF = 指标.lazyMapCache(() => Math.min(净上涨成交量12.length, 净上涨成交量26.length), i => 净上涨成交量12[i] - 净上涨成交量26[i])
        const 净上涨成交量DEM = 指标.EMA(净上涨成交量DIF, 9, RealDataBase.单位时间)




        const 上涨_下跌 = 指标.lazyMapCache(() => Math.min(净成交量均线30.length), i => 净成交量均线30[i] >= 0 ? '上涨' : '下跌')



        const 波动率差_除以时间 = 指标.lazyMapCache2({ 起点index: NaN, 起点Type: 'none' as '上涨' | '下跌' }, (arr: number[], ext) => {
            const length = Math.min(波动率.length, 上涨_下跌.length)

            for (let i = Math.max(0, arr.length - 1); i < length; i++) {

                //开始
                if (isNaN(ext.起点index) || ext.起点index === length - 1) {   //最后一个重新计算  
                    if (波动率[i] >= 3) {
                        ext.起点index = i
                        ext.起点Type = 上涨_下跌[i]
                    }
                }
                //结束
                else {
                    if (波动率[i] >= 20 || 上涨_下跌[i] !== ext.起点Type) {
                        ext.起点index = NaN
                    }
                }

                arr[i] = 波动率[i] > 5 && isNaN(ext.起点index) === false ? (波动率[i] - 3) / (i - ext.起点index) : NaN  //除以根数

            }
        })


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
            const length = Math.min(上涨_下跌.length, 最高价10.length, 最低价10.length)
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
                    arr[i] = 最高价10[i] - ext.起点价格
                }
                else if (type === '下跌') {
                    arr[i] = ext.起点价格 - 最低价10[i]
                }
            }
        })


        const 上涨_累计成交量 = 累计成交量('上涨')
        const 上涨_价差 = 价差('上涨')
        const 上涨_动力 = 指标.lazyMapCache(() => Math.min(上涨_累计成交量.length, 上涨_价差.length), i => to范围({min:30*10000,max:130*10000,value:上涨_累计成交量[i] / Math.max(1, 上涨_价差[i])}) ) //最小除以1
        const 上涨 = {
            累计成交量: 上涨_累计成交量,
            价差: 上涨_价差,
            动力: 上涨_动力,
        }

        const 下跌_累计成交量 = 累计成交量('下跌')
        const 下跌_价差 = 价差('下跌')
        const 下跌_动力 = 指标.lazyMapCache(() => Math.min(下跌_累计成交量.length, 下跌_价差.length), i => to范围({min:30*10000,max:130*10000,value:下跌_累计成交量[i] / Math.max(1, 下跌_价差[i])})) //最小除以1
        const 下跌 = {
            累计成交量: 下跌_累计成交量,
            价差: 下跌_价差,
            动力: 下跌_动力,
        }
        const 上涨_动力12 = 指标.EMA(上涨_动力, 6, RealDataBase.单位时间)
        const 上涨_动力26 = 指标.EMA(上涨_动力, 13, RealDataBase.单位时间)
        const 上涨_动力DIF = 指标.lazyMapCache(() => Math.min(上涨_动力12.length, 上涨_动力26.length), i => 上涨_动力12[i] - 上涨_动力26[i])
        const 上涨_动力DEM = 指标.EMA(上涨_动力DIF, 5, RealDataBase.单位时间)

        const 上涨_动力20均线 = 指标.均线(
            指标.lazyMapCache(() => 上涨_动力.length, i => 上涨_动力[i]),
            20,
            RealDataBase.单位时间
        )
        const 上涨_动力10均线 = 指标.均线(
            指标.lazyMapCache(() => 上涨_动力.length, i => 上涨_动力[i]),
            10,
            RealDataBase.单位时间
        )

        const 下跌_动力12 = 指标.EMA(下跌_动力, 6, RealDataBase.单位时间)
        const 下跌_动力26 = 指标.EMA(下跌_动力, 13, RealDataBase.单位时间)
        const 下跌_动力DIF = 指标.lazyMapCache(() => Math.min(下跌_动力12.length, 下跌_动力26.length), i => 下跌_动力12[i] - 下跌_动力26[i])
        const 下跌_动力DEM = 指标.EMA(下跌_动力DIF, 5, RealDataBase.单位时间)


        const 下跌_动力20均线 = 指标.均线(
            指标.lazyMapCache(() => 下跌_动力.length, i => 下跌_动力[i]),
            20,
            RealDataBase.单位时间
        )
        const 下跌_动力10均线 = 指标.均线(
            指标.lazyMapCache(() => 下跌_动力.length, i => 下跌_动力[i]),
            10,
            RealDataBase.单位时间
        )


        //信号_上涨
        const 盘口买2秒均线 = 指标.均线(
            指标.lazyMapCache(() => 盘口买.length, i => 盘口买[i]),
            1.5,
            RealDataBase.单位时间
        )


        //const 波动率大巨大大分界 = 50
        const 波动率中大分界 = 25
        //const 波动率中大分界 = 20
        const 信号_上涨 = 指标.lazyMapCache(
            () => Math.min(
                净盘口.length,
                净盘口均线.length,
                盘口买2秒均线.length,
                波动率.length,
                上涨还是下跌.length,
                自动下单条件.length,
                净上涨成交量DIF.length,
                净上涨成交量DEM.length,
                波动率.length,
            ),
            i => {
                //如果波动率比较小，那么对盘口的容忍度要大一些，因为没有经过充分博弈，小波动最大容忍度150万，大波动最大容忍度100万
                let b = false
                if (波动率[i] < 波动率中大分界) {
                    if (盘口买[i] < 100 * 10000) {
                        if (净盘口[i] <= (净盘口均线[i] + 50 * 10000)) {
                            if (净盘口[i] < 5 * 100000) {
                                b = true
                            }
                        }
                    } else {
                        if (盘口买[i] < 150 * 10000) {
                            if (净盘口[i] <= (净盘口均线[i])) {
                                if (净盘口[i] < 0) {
                                    b = true
                                }
                            }
                        }
                    }
                } else {
                    if (盘口买[i] < 50 * 10000) {
                        if (净盘口[i] <= (净盘口均线[i] + 50 * 10000)) {
                            if (净盘口[i] < 5 * 100000) {
                                b = true
                            }
                        }
                    } else {
                        if (盘口买[i] < 100 * 10000) {
                            if (净盘口[i] <= (净盘口均线[i])) {
                                if (净盘口[i] < 0) {
                                    b = true
                                }
                            }
                        }
                    }
                }
                if (b === false) {
                    if (波动率[i] > 波动率中大分界) {
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
                //波动率大于25之后，出现一次真空信号，动力慢信号都为true
                //波动率大于5之后，出现一次动力10均线小于20均线，动力慢信号都为true，这就表明动力已经经过了一个衰弱过程，
                //遗留问题，真空信号的替代问题
                //净成交量《0，真空信号可以替代净成交量信号，范围，净成交量的快均线不能大于慢均线太多
                //用语言描述出容易止损的波动的不同之处
                let c = false
                if(波动率[i] < 波动率中大分界 ){
                    if(净上涨成交量DIF[i] < 净上涨成交量DEM[i] ){
                        c = true
                    }else{
                        //macd刻画的是局部性质，当快均线只大于慢均线一点点的时候，如果净下跌量又很小了，那么可以认为成交量萎缩也是成立的
                        if(净上涨成交量DIF[i] <净上涨成交量DEM[i]*1.1){
                            if(净成交量均线10[i]<50*10000){
                                c = true
                            }
                        }
                    }
                }else{
                    if (净上涨成交量DIF[i] < 净上涨成交量DEM[i]&&净上涨成交量DIF[i] < 0){
                        c = true
                    }else{
                        //macd刻画的是局部性质，当快均线只大于慢均线一点点的时候，如果净下跌量又很小了，那么可以认为成交量萎缩也是成立的
                        if(净上涨成交量DIF[i] <净上涨成交量DEM[i]*1.1){
                            if(净成交量均线10[i]<50*10000){
                                c = true
                            }
                        }
                    }
                }



                return [
                    { name: '真空', value: 波动率[i] < 波动率中大分界 || 真空信号涨[i] },
                    { name: '成交量DIF<DEM', value: c},
                    { name: ' 净盘口<净盘口均线<0', value: b },
                    { name: '30秒净买成交量 >=150万', value: 净上涨成交量30[i] >= 150 * 10000 },
                    { name: '折返程度<', value: (最高价10[i] - 价格[i]) < 折返率[i] },
                    { name: '价格速度', value: 波动率[i] >= 20 || 波动率差_除以时间[i] >= 0.06 },
                    { name: '波动率 >=8', value: 波动率[i] >= 8 },
                    //波动率大于25之后，出现一次真空信号，动力慢信号都为true
                    //{ name: '动力衰竭', value: 波动率[i] > 波动率中大分界 || (上涨_动力DIF[i] - 上涨_动力DEM[i]) / 上涨_动力DEM[i] < 0.05 },
                    { name: '量化 is上涨', value: 净成交量均线60[i] > 0 },
                    { name: '波动率最大限制', value: 波动率[i] < 200 },
                    //{ name: '量化 自动下单条件', value: 上涨还是下跌[i] === '上涨' && 自动下单条件[i] },
                ]
            }
        )
        const 信号_上涨做空下跌平仓 = 指标.lazyMapCache(
            () => Math.min(
                净盘口.length,
                净盘口均线.length,
                盘口买2秒均线.length,
                波动率.length,
                上涨还是下跌.length,
                自动下单条件.length,
                净上涨成交量DIF.length,
                净上涨成交量DEM.length,
                波动率.length,
            ),
            i => {
                return [
                    { name: '成交量DIF<DEM', value: 净下跌成交量DIF[i] < 净下跌成交量DEM[i] },
                    { name: '折返程度<', value: (最高价10[i] - 价格[i]) > 折返率[i] },
                    //{ name: ' 净盘口<净盘口均线<0', value: b },
                    //波动率大于25之后，出现一次真空信号，动力慢信号都为true
                    //{ name: '动力衰竭', value: 波动率[i] > 波动率中大分界 || (上涨_动力DIF[i] - 上涨_动力DEM[i]) / 上涨_动力DEM[i] < 0.05 },
                    //{ name: '量化 is上涨', value: 净成交量均线60[i] > 0 },
                    //{ name: '量化 自动下单条件', value: 上涨还是下跌[i] === '上涨' && 自动下单条件[i] },
                ]
            }
        )
        const 信号_追涨 = 指标.lazyMapCache(
            () => Math.min(
                净盘口.length,
                净盘口均线.length,
                盘口买2秒均线.length,
                波动率.length,
                上涨还是下跌.length,
                自动下单条件.length,
                净上涨成交量DIF.length,
                净上涨成交量DEM.length,
                波动率.length,
            ),
            i => {
                return [
                   // { name: '成交量DIF>DEM', value: 净上涨成交量DIF[i] > 净上涨成交量DEM[i] },
                    //{ name: '净盘口>0', value: 净盘口[i]>0 },
                   //{ name: '卖盘低量', value: 盘口卖[i] < 50 * 10000 },波动率5分钟
                   { name: '5分钟波动率低量', value: 波动率5分钟[i] < 30 },
                    { name: '波动率 >=1', value: 波动率[i] >= 1 },
                    { name: '60秒净成交量 >=100万', value: 净成交量均线60[i] >= 100 * 10000 },
                    { name: '折返程度<', value: (最高价10[i] - 价格[i]) < 折返率[i] },
                    { name: '追涨', value: 上涨.动力[i] > 100 * 10000 },
                    //量化用 净上涨成交量DIF
                    { name: '量化 is上涨', value: 净成交量均线60[i] > 0 },
                    //{ name: '量化 自动下单条件', value: 上涨还是下跌[i] === '上涨' && 自动下单条件[i] },
                ]
            }
        )


        //下跌 重复
        const 盘口卖2秒均线 = 指标.均线(
            指标.lazyMapCache(() => 盘口卖.length, i => 盘口卖[i]),
            1.5,
            RealDataBase.单位时间
        )
        const 信号_下跌 = 指标.lazyMapCache(
            () => Math.min(
                净盘口.length,
                净盘口均线.length,
                盘口卖2秒均线.length,
                波动率.length,
                上涨还是下跌.length,
                自动下单条件.length,
                净上涨成交量DIF.length,
                净上涨成交量DEM.length,
                波动率.length,
            ),
            i => {
                let b = false
                if (波动率[i] < 波动率中大分界) {
                    if (盘口卖[i] < 100 * 10000) {
                        if (净盘口[i] >= (净盘口均线[i] - 50 * 10000)) {
                            if (净盘口[i] > (- 50 * 10000)) {
                                b = true
                            }
                        }
                    } else {
                        if (盘口卖[i] < 150 * 10000) {
                            if (净盘口[i] >= 净盘口均线[i]) {
                                if (净盘口[i] > 0) {
                                    b = true
                                }
                            }
                        }
                    }
                } else {
                    if (盘口卖[i] < 50 * 10000) {
                        if (净盘口[i] >= (净盘口均线[i] - 50 * 10000)) {
                            if (净盘口[i] > (- 50 * 10000)) {
                                b = true
                            }
                        }
                    } else {
                        if (盘口卖[i] < 100 * 10000) {
                            if (净盘口[i] >= 净盘口均线[i]) {
                                if (净盘口[i] > 0) {
                                    b = true
                                }
                            }
                        }
                    }
                }
                if (b === false) {
                    if (波动率[i] > 波动率中大分界) {
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
                //净下跌成交量DIF[i] < 净下跌成交量DEM[i] && (波动率[i] < 波动率中大分界 ? true : 净下跌成交量DIF[i] < 0) 
                let c = false
                if(波动率[i] < 波动率中大分界 ){
                    if(净下跌成交量DIF[i] < 净下跌成交量DEM[i] ){
                        c = true
                    }else if(净下跌成交量DIF[i] <净下跌成交量DEM[i]*1.1){
                        if(净成交量均线10[i]>-50*10000){
                            c = true
                        }
                    }
                }else{
                    if (净下跌成交量DIF[i] < 净下跌成交量DEM[i]&&净下跌成交量DIF[i] < 0){
                        c = true
                    }else{
                        //macd刻画的是局部性质，当快均线只大于慢均线一点点的时候，如果净下跌量又很小了，那么可以认为成交量萎缩也是成立的
                        if(净下跌成交量DIF[i] <净下跌成交量DEM[i]*1.1){
                            if(净成交量均线10[i]>-50*10000){
                                c = true
                            }
                        }
                    }
                }

                //净成交量均线10
                return [
                    { name: '真空', value: 波动率[i] < 波动率中大分界 || 真空信号跌[i] },
                    { name: '卖成交量DIF<DEM', value: c },
                    //{ name: '卖成交量DIF<DEM', value: 净下跌成交量DIF[i] < 净下跌成交量DEM[i] && (波动率[i] < 波动率中大分界 ? true : 净下跌成交量DIF[i] < 0) },
                    { name: ' 净盘口 > 净盘口均线>0', value: b },
                    { name: '30秒净卖成交量>150万', value: 净下跌成交量30[i] >= 150 * 10000 },
                    { name: '折返程度<', value: (价格[i] - 最低价10[i]) < 折返率[i] },
                    //{ name: '动力衰竭', value: 波动率[i] > 波动率中大分界 || (下跌_动力DIF[i] - 下跌_动力DEM[i]) / 下跌_动力DEM[i] < 0.05 },
                    { name: '价格速度', value: 波动率[i] >= 20 || 波动率差_除以时间[i] >= 0.06 },
                    { name: '波动率 >=8', value: 波动率[i] >= 8 },
                    //量化用
                    { name: '量化 is下跌', value: 净成交量均线60[i] < 0 },
                    { name: '波动率最大限制', value: 波动率[i] < 200 },
                    //{ name: '量化 自动下单条件', value: 上涨还是下跌[i] === '下跌' && 自动下单条件[i] },
                ]
            }
        )
        const 信号_下跌抄底上涨平仓 = 指标.lazyMapCache(
            () => Math.min(
                净盘口.length,
                净盘口均线.length,
                盘口卖2秒均线.length,
                波动率.length,
                上涨还是下跌.length,
                自动下单条件.length,
                净上涨成交量DIF.length,
                净上涨成交量DEM.length,
                波动率.length,
            ),
            i => {
                return [
                    { name: '卖成交量DIF<DEM', value: 净上涨成交量DIF[i] < 净上涨成交量DEM[i] },
                    { name: '折返程度<', value: (价格[i] - 最低价10[i]) > 折返率[i] },
                ]
            }
        )

        const 信号_追跌 = 指标.lazyMapCache(
            () => Math.min(
                净盘口.length,
                净盘口均线.length,
                盘口卖2秒均线.length,
                波动率.length,
                上涨还是下跌.length,
                自动下单条件.length,
                净上涨成交量DIF.length,
                净上涨成交量DEM.length,
                波动率.length,
            ),
            i => {
                return [
                    //{ name: '卖成交量DIF>DEM', value: 净下跌成交量DIF[i] > 净下跌成交量DEM[i] },
                    //{ name: '净盘口<0', value: 净盘口[i]<0 },
                    { name: '5分钟波动率低量', value: 波动率5分钟[i] < 30 },
                    { name: '波动率 >=1', value: 波动率[i] >= 1 },
                    { name: '买盘低量', value: 盘口买[i] < 50 * 10000 },
                    { name: '60秒净成交量<=-100万', value: 净成交量均线60[i] <= -100 * 10000 },
                    { name: '折返程度<', value: (价格[i] - 最低价10[i]) < 折返率[i] },
                    { name: '追跌', value: 下跌.动力[i] > 100 * 10000 },
                    { name: '量化 is下跌', value: 净成交量均线60[i] < 0 },
                    //{ name: '量化 自动下单条件', value: 上涨还是下跌[i] === '下跌' && 自动下单条件[i] },
                ]
            }
        )


        return {
            波动率5分钟,
            净成交量均线10,
            净成交量均线120,
            折返率,
            成交量买,
            成交量卖,
            信号_上涨做空下跌平仓,
            信号_下跌抄底上涨平仓,
            波动率差_除以时间,
            上涨_下跌,
            上涨_动力20均线,
            上涨_动力10均线,
            下跌_动力20均线,
            下跌_动力10均线,
            上涨_动力DIF,
            上涨_动力DEM,
            下跌_动力DIF,
            下跌_动力DEM,
            价格均线,
            净上涨成交量DIF,
            净上涨成交量DEM,
            净下跌成交量DIF,
            净下跌成交量DEM,
            上涨,
            下跌,
            价格, 波动率, 盘口买, 盘口卖, 净盘口, 净盘口均线,
            阻力3涨, 阻力3跌,
            真空信号涨,
            真空信号跌,
            净成交量,
            净成交量均线60,
            //净成交量均线30,
            成交量均线买1,
            成交量均线卖1,
            成交量买均线5,
            成交量卖均线5,
            成交量买均线30,
            成交量卖均线30,
            // 盘口买1,盘口卖1,净盘口1,净盘口均线1,


            // 买MACD: {
            //     买成交量DIF,
            //     买成交量DEM,
            //     //OSC,
            // },

            // 卖MACD: {
            //     卖成交量DIF,
            //     卖成交量DEM,
            //     //卖成交量OSC1,
            // },
            //信号_上涨1,
            //信号_下跌1,
            信号_上涨,
            信号_追涨,
            信号_下跌,
            信号_追跌,

            价格均线60,
            最高价10,
            最低价10,
        }
    }


    private item = (symbol: BaseType.BitmexSymbol, binanceSymbol: BaseType.BinanceSymbol, hopexSymbol: BaseType.HopexSymbol) => {

        const 现货 = this.item2(this.data.binance[binanceSymbol], false)

        const 期货 = this.item2(this.data.bitmex[symbol], true)

        const hopex = this.item2(this.data.hopex[hopexSymbol], false)

        //差价
        const 差价 = 指标.lazyMapCache(() => Math.min(现货.价格.length, 期货.价格.length), i => 现货.价格[i] - 期货.价格[i])
        const 差价均线 = 指标.均线(差价, 300, RealDataBase.单位时间)






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


    private 默认期货波动率 = 30



}