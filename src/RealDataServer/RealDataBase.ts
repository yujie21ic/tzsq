import { JSONSync } from '../lib/C/JSONSync'
import { BaseType } from '../lib/BaseType'
import { sum } from 'ramda'
import { 指标 } from './指标'
import { Sampling } from '../lib/C/Sampling'
import { kvs } from '../lib/F/kvs'
import { to范围 } from '../lib/F/to范围'


export class RealDataBase {
    static 单位时间 = 500

    private 删除历史() {
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
        }
    }

    protected jsonSync = new JSONSync(
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

    private on盘口Dic = Object.create(null) as {
        [symbol: string]: Sampling<BaseType.OrderBook>
    }

    protected on盘口(p: {
        symbol: string
        xxxxxxxx: {
            ____push: (v: BaseType.OrderBook) => void
            ____updateLast: (v: BaseType.OrderBook) => void
        }
        timestamp: number
        orderBook: BaseType.OrderBook
    }) {
        this.删除历史()
        const tick = Math.floor(p.timestamp / RealDataBase.单位时间)

        if (this.data.startTick === 0) {
            this.jsonSync.data.startTick.____set(tick)
        }

        if (this.on盘口Dic[p.symbol] === undefined) {
            this.on盘口Dic[p.symbol] = new Sampling<BaseType.OrderBook>({
                buy: '最新',
                sell: '最新',
            })
            this.on盘口Dic[p.symbol].onNew2 = item => p.xxxxxxxx.____push(item)
            this.on盘口Dic[p.symbol].onUpdate2 = item => p.xxxxxxxx.____updateLast(item)
            this.on盘口Dic[p.symbol].in2({
                id: this.data.startTick,
                buy: [],
                sell: [],
            })
        }

        this.on盘口Dic[p.symbol].in2(p.orderBook)
    }



    private on着笔Dic = Object.create(null) as {
        [symbol: string]: Sampling<BaseType.KLine>
    }

    protected on着笔(p: {
        symbol: string
        xxxxxxxx: {
            ____push: (v: BaseType.KLine) => void;
            ____updateLast: (v: BaseType.KLine) => void;
        }
        timestamp: number
        side: BaseType.Side
        price: number
        size: number
    }) {
        this.删除历史()

        const tick = Math.floor(p.timestamp / RealDataBase.单位时间)

        if (this.data.startTick === 0) {
            this.jsonSync.data.startTick.____set(tick)
        }

        if (this.on着笔Dic[p.symbol] === undefined) {
            this.on着笔Dic[p.symbol] = new Sampling<BaseType.KLine>({
                open: '开',
                high: '高',
                low: '低',
                close: '收',
                buySize: '累加',
                buyCount: '累加',
                sellSize: '累加',
                sellCount: '累加',
            })
            this.on着笔Dic[p.symbol].onNew2 = item => p.xxxxxxxx.____push(item)
            this.on着笔Dic[p.symbol].onUpdate2 = item => p.xxxxxxxx.____updateLast(item)
            this.on着笔Dic[p.symbol].in2({
                id: this.data.startTick,
                open: NaN,
                high: NaN,
                low: NaN,
                close: NaN,
                buySize: NaN,
                buyCount: NaN,
                sellSize: NaN,
                sellCount: NaN,
            })
        }

        this.on着笔Dic[p.symbol].in2({
            id: tick,
            open: p.price,
            high: p.price,
            low: p.price,
            close: p.price,
            buySize: p.side === 'Buy' ? p.size : 0,
            buyCount: p.side === 'Buy' ? 1 : 0,
            sellSize: p.side === 'Sell' ? p.size : 0,
            sellCount: p.side === 'Sell' ? 1 : 0,
        })
    }

    get data() {
        return this.jsonSync.rawData
    }


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

        // const 多少秒均线 = Math.floor(this.默认期货波动率 / 3.3 + 1) 
        const 多少秒均线 = this.默认期货波动率

        const 价格 = 盘口算价格 ?

            指标.lazyMapCache(() => orderBook.length, i =>
                (orderBook[i].buy && orderBook[i].buy.length > 0 && orderBook[i].sell && orderBook[i].sell.length > 0) ?
                    ((orderBook[i].buy[0].price + orderBook[i].sell[0].price) / 2) : NaN) :

            指标.lazyMapCache(() => data.length, i => data[i].close)


        //和别的时间参数不一样
        const 价格均线 = 指标.均线(价格, 300, RealDataBase.单位时间)
        const 波动率 = 指标.波动率(价格, 30, RealDataBase.单位时间)


        const 成交量买 = 指标.lazyMapCache(() => data.length, i => Math.abs(data[i].buySize))
        const 成交量卖 = 指标.lazyMapCache(() => data.length, i => Math.abs(data[i].sellSize))
        const 净成交量 = 指标.lazyMapCache(() => data.length, i => Math.abs(成交量买[i] - 成交量卖[i]))
        const 成交次数买 = 指标.lazyMapCache(() => data.length, i => data[i].buyCount)
        const 成交次数卖 = 指标.lazyMapCache(() => data.length, i => data[i].sellCount)

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


        const 成交量均线买5 = 指标.累加(
            指标.lazyMapCache(() => 成交量买.length, i => 成交量买[i]),
            5,
            RealDataBase.单位时间
        )
        const 成交量均线卖5 = 指标.累加(
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
        // const 成交量均线1 = 指标.累加(
        //     指标.lazyMapCache(() => Math.min(成交量买.length, 成交量卖.length), i => Math.max(成交量买均线1[i],成交量卖均线1[i])-Math.min(成交量买均线1[i],成交量卖均线1[i]) ),
        //     多少秒均线,
        //     RealDataBase.单位时间
        // )
        const 净成交量均线30 = 指标.lazyMapCache(() => data.length, i => Math.max(成交量买均线30[i], 成交量卖均线30[i]) - Math.min(成交量买均线30[i], 成交量卖均线30[i]))


        const 盘口买 = 指标.lazyMapCache(() => orderBook.length, i => sum(orderBook[i].buy.map(v => v.size)))
        const 盘口卖 = 指标.lazyMapCache(() => orderBook.length, i => sum(orderBook[i].sell.map(v => v.size)))
        const 净盘口 = 指标.lazyMapCache(() => Math.min(盘口买.length, 盘口卖.length), i => 盘口买[i] - Math.abs(盘口卖[i]))
        const 净盘口均线 = 指标.均线(
            指标.lazyMapCache(() => Math.min(盘口买.length, 盘口卖.length), i => 净盘口[i]),
            5,
            RealDataBase.单位时间
        )
        //const 净盘口均线 = 指标.均线(净盘口, 多少秒均线, RealDataBase.单位时间)



        const 价格30秒均线 = 指标.均线(价格, 30, RealDataBase.单位时间)
        const 阻力2涨 = 指标.阻力2({
            价格,
            价格均线: 价格30秒均线,
            成交量: 成交量买,
            type: '涨',
        })

        const 阻力2跌 = 指标.阻力2({
            价格,
            价格均线: 价格30秒均线,
            成交量: 成交量卖,
            type: '跌',
        })

        const 阻力1 = 指标.阻力({
            price: 价格,
            volumeBuy: 成交量买,
            volumeSell: 成交量卖,
        })
        const 阻力1涨 = 指标.lazyMapCache(() => 阻力1.length, i => Math.max(0, 阻力1[i]))
        const 阻力1跌 = 指标.lazyMapCache(() => 阻力1.length, i => Math.min(0, 阻力1[i]))


        const 阻力3 = 指标.阻力3({
            price: 价格,
            volumeBuy: 成交量买,
            volumeSell: 成交量卖,
        })
        const 阻力3涨 = 指标.lazyMapCache(() => 阻力3.length, i => Math.max(0, 阻力3[i].阻力))
        let 阻力3跌 = 指标.lazyMapCache(() => 阻力3.length, i => Math.min(0, 阻力3[i].阻力))
        //if(阻力3跌<-2000000)阻力3跌=-2000000


        const 阻力3涨12 = 指标.EMA(阻力3涨, 12, RealDataBase.单位时间)
        const 阻力3涨26 = 指标.EMA(阻力3涨, 26, RealDataBase.单位时间)
        const 阻力3涨DIF = 指标.lazyMapCache(() => Math.max(阻力3涨12.length, 阻力3涨26.length), i => 阻力3涨12[i] - 阻力3涨26[i])
        const 阻力3涨DEM = 指标.EMA(阻力3涨DIF, 9, RealDataBase.单位时间)

        const 阻力3跌12 = 指标.EMA(阻力3跌, 12, RealDataBase.单位时间)
        const 阻力3跌26 = 指标.EMA(阻力3跌, 26, RealDataBase.单位时间)
        const 阻力3跌DIF = 指标.lazyMapCache(() => Math.max(阻力3跌12.length, 阻力3跌26.length), i => 阻力3跌12[i] - 阻力3跌26[i])
        const 阻力3跌DEM = 指标.EMA(阻力3跌DIF, 9, RealDataBase.单位时间)



        const 阻力4 = 指标.阻力4({
            price: 价格,
            volumeBuy: 成交量买,
            volumeSell: 成交量卖,
        })
        const 阻力4涨 = 指标.lazyMapCache(() => 阻力4.length, i => Math.max(0, 阻力4[i].阻力))
        let 阻力4跌 = 指标.lazyMapCache(() => 阻力4.length, i => Math.min(0, 阻力4[i].阻力))



        const 真空 = 指标.真空({
            price: 价格,
            volumeBuy: 成交量买,
            volumeSell: 成交量卖,
        })
        const 真空涨 = 指标.lazyMapCache(() => 真空.length, i => Math.max(0, 真空[i]))
        const 真空跌 = 指标.lazyMapCache(() => 真空.length, i => Math.min(0, 真空[i]))

        //真空信号  阻力小于10万，价差大于5
        const 真空信号涨 = 指标.lazyMapCache(() => 价格.length, i => (阻力3[i].阻力 < 200000) && 阻力3[i].阻力 > 0 && 阻力3[i].价钱增量 > 4)
        const 真空信号跌 = 指标.lazyMapCache(() => 价格.length, i => (阻力3[i].阻力 > -200000) && 阻力3[i].阻力 < 0 && 阻力3[i].价钱增量 > 4)
        //const 真空信号涨 = 指标.lazyMapCache(() => 阻力3.length, i => (阻力3[i].阻力 < to范围({ value: 波动率[i] / 10 * 10000, min: 100000, max: 400000 }) && 阻力3[i].阻力 > 0 && 阻力3[i].价钱增量 > to范围({ value: 波动率[i] / 15, min: 3, max: 30 })))
        //const 真空信号跌 = 指标.lazyMapCache(() => 阻力3.length, i => (阻力3[i].阻力 < 0 && 阻力3[i].阻力 > to范围({ value: -波动率[i] / 10 * 10000, max: -100000, min: -400000 }) && 阻力3[i].价钱增量 > to范围({ value: 波动率[i] / 15, min: 3, max: 30 })))


        const 阻力笔 = 指标.阻力笔(价格)

        const 价格均线60 = 指标.均线(价格, 60, RealDataBase.单位时间)
        const 最高价10 = 指标.最高(价格, 10, RealDataBase.单位时间)
        const 最低价10 = 指标.最低(价格, 10, RealDataBase.单位时间)

        const 涨价差 = 指标.lazyMapCache(() => Math.min(最高价10.length, 价格均线60.length), i => Math.abs(最高价10[i] - 价格均线60[i]))
        const 涨价差__除以__这一段内的成交量 = 指标.lazyMapCache2({ 累计成交量: 0 }, (arr: number[], ext) => {
            for (let i = Math.max(0, arr.length - 1); i < Math.min(涨价差.length, 成交量买.length, 成交量卖.length); i++) {
                if (涨价差[i] < 0.01) {
                    ext.累计成交量 = 0
                } else {
                    ext.累计成交量 += 成交量买[i] + 成交量卖[i]
                }
                arr[i] = ext.累计成交量 === 0 ? NaN : 涨价差[i] / ext.累计成交量
            }
        })

        //重复
        const 跌价差 = 指标.lazyMapCache(() => Math.min(最低价10.length, 价格均线60.length), i => Math.abs(最低价10[i] - 价格均线60[i]))
        const 跌价差__除以__这一段内的成交量 = 指标.lazyMapCache2({ 累计成交量: 0 }, (arr: number[], ext) => {
            for (let i = Math.max(0, arr.length - 1); i < Math.min(跌价差.length, 成交量买.length, 成交量卖.length); i++) {
                if (跌价差[i] < 0.01) {
                    ext.累计成交量 = 0
                } else {
                    ext.累计成交量 += 成交量买[i] + 成交量卖[i]
                }
                arr[i] = ext.累计成交量 === 0 ? NaN : 跌价差[i] / ext.累计成交量
            }
        })

        //  补完涨价差/这一段内的成交量
        //  补完跌价差/这一段内的成交量

        // const 价格EMA12 = 指标.EMA(成交量买, 12, RealDataBase.单位时间)
        // const 价格EMA26 = 指标.EMA(成交量买, 26, RealDataBase.单位时间)
        // const 价格DIF = 指标.lazyMapCache(() => Math.max(价格EMA12.length, 价格EMA26.length), i => 价格EMA12[i] - 价格EMA26[i])
        // const 价格DEM = 指标.EMA(价格DIF, 12, RealDataBase.单位时间)
        // const 价格OSC = 指标.lazyMapCache(() => Math.max(价格DIF.length, 价格DEM.length), i => 价格DIF[i] - 价格DEM[i])

        //MACD  19 40
        const EMA12 = 指标.EMA(成交量买, 12, RealDataBase.单位时间)
        const EMA26 = 指标.EMA(成交量买, 26, RealDataBase.单位时间)
        const DIF = 指标.lazyMapCache(() => Math.max(EMA12.length, EMA26.length), i => EMA12[i] - EMA26[i])
        const DEM = 指标.EMA(DIF, 9, RealDataBase.单位时间)
        const OSC = 指标.lazyMapCache(() => Math.max(DIF.length, DEM.length), i => DIF[i] - DEM[i])

        const a = 指标.EMA(成交量卖, 12, RealDataBase.单位时间)
        const b = 指标.EMA(成交量卖, 26, RealDataBase.单位时间)
        const DIF1 = 指标.lazyMapCache(() => Math.max(a.length, b.length), i => a[i] - b[i])
        const DEM1 = 指标.EMA(DIF1, 9, RealDataBase.单位时间)
        const OSC1 = 指标.lazyMapCache(() => Math.max(DIF1.length, DEM1.length), i => DIF1[i] - DEM[i])

        const 上涨价格12 = 指标.EMA(最高价10, 6, RealDataBase.单位时间)
        const 上涨价格26 = 指标.EMA(最高价10, 13, RealDataBase.单位时间)
        const 上涨价格DIF = 指标.lazyMapCache(() => Math.max(上涨价格12.length, 上涨价格26.length), i => 上涨价格12[i] - 上涨价格26[i])
        const 上涨价格DEM = 指标.EMA(上涨价格DIF, 12, RealDataBase.单位时间)
        //const 价格OSC = 指标.lazyMapCache(() => Math.max(DIF.length, DEM.length), i => DIF[i] - DEM[i])
        const 下跌价格12 = 指标.EMA(最低价10, 6, RealDataBase.单位时间)
        const 下跌价格26 = 指标.EMA(最低价10, 13, RealDataBase.单位时间)
        const 下跌价格DIF = 指标.lazyMapCache(() => Math.max(下跌价格12.length, 下跌价格26.length), i => 下跌价格12[i] - 下跌价格26[i])
        const 下跌价格DEM = 指标.EMA(下跌价格DIF, 12, RealDataBase.单位时间)


        //信号_上涨
        const 盘口买2秒均线 = 指标.均线(
            指标.lazyMapCache(() => 盘口买.length, i => 盘口买[i]),
            1.5,
            RealDataBase.单位时间
        )

        const 信号_上涨 = 指标.lazyMapCache(
            () => Math.min(
                净盘口.length,
                净盘口均线.length,
                盘口买2秒均线.length,
                DIF.length,
                DEM.length,
                波动率.length
            ),
            i => [
                { name: '真空信号涨', value: 真空信号涨[i] },
                { name: '净盘口均线 < 0', value: 净盘口均线[i] < 100000 },
                { name: '净盘口 < 净盘口均线', value: 净盘口[i] < 净盘口均线[i] },
                { name: '买盘口必须低量', value: 真空信号涨[i] || 盘口买2秒均线[i] < (波动率[i] < 15 ? 100 : 50) * 10000 },
                { name: '成交量买快均线 < 慢均线', value: DIF[i] < DEM[i] },
                //{ name: '价格快均线 < 慢均线', value: 波动率[i]>20?true:上涨价格DIF[i] < 上涨价格DEM[i] },
                { name: '波动率 > 5', value: 波动率[i] > 5 },
            ]
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
                DIF1.length,
                DEM1.length,
                波动率.length
            ),
            i => [
                { name: '真空信号跌', value: 真空信号跌[i] },
                { name: '净盘口均线 > 0', value: Math.abs(净盘口均线[i]) > -100000 },
                { name: '净盘口 > 净盘口均线', value: 净盘口[i] > 净盘口均线[i] },
                { name: '卖盘口必须低量', value: 真空信号跌[i] || 盘口卖2秒均线[i] < (波动率[i] < 15 ? 100 : 50) * 10000 },
                { name: '成交量卖快均线 < 慢均线', value: DIF1[i] < DEM1[i] },
                //{ name: '价格快均线 > 慢均线', value: 波动率[i]>20?true:下跌价格DIF[i] > 下跌价格DEM[i] },
                { name: '波动率 > 5', value: 波动率[i] > 5 },
            ]
        )

        //上涨速度
        //下跌速度



        const 上涨速度 = 指标.lazyMapCache2({ last交叉Index: 0 }, (arr: number[], ext) => {
            for (let i = Math.max(0, arr.length - 1); i < Math.min(价格均线60.length, 最高价10.length); i++) {
                const 时间ms = (i - ext.last交叉Index) / (1000 / RealDataBase.单位时间)
                if (时间ms === 0) {
                    arr[i] = NaN
                } else {
                    let a = (最高价10[i] - 价格均线60[i]) / 时间ms
                    // let a = 波动率[i]/ 时间ms
                    //arr[i] = a
                    if (a > 0.5) {
                        arr[i] = 0.5
                    } else {
                        arr[i] = a
                    }
                }
                //arr[i] = 时间ms === 0 ? NaN : (最高价10[i] - 价格均线60[i]) / 时间ms

                if (Math.abs(最高价10[i] - 价格均线60[i]) < 0.01) {
                    ext.last交叉Index = i
                }
            }
        })

        const 上涨速度12 = 指标.EMA(上涨速度, 12, RealDataBase.单位时间)
        const 上涨速度26 = 指标.EMA(上涨速度, 26, RealDataBase.单位时间)
        const 上涨速度DIF = 指标.lazyMapCache(() => Math.max(上涨速度12.length, 上涨速度26.length), i => 上涨速度12[i] - 上涨速度26[i])
        const 上涨速度DEM = 指标.EMA(上涨速度DIF, 9, RealDataBase.单位时间)
        //const 上涨速度OSC = 指标.lazyMapCache(() => Math.max(上涨速度DIF.length, 上涨速度DEM.length), i => 上涨速度DIF[i] - 上涨速度DEM[i])



        const 下跌速度 = 指标.lazyMapCache2({ last交叉Index: 0 }, (arr: number[], ext) => {
            for (let i = Math.max(0, arr.length - 1); i < Math.min(价格均线60.length, 最低价10.length); i++) {
                const 时间ms = (i - ext.last交叉Index) / (1000 / RealDataBase.单位时间)

                if (时间ms === 0) {
                    arr[i] = NaN
                } else {
                    let a = (价格均线60[i] - 最低价10[i]) / 时间ms
                    // let a = 波动率[i]/ 时间ms
                    //arr[i] = a
                    if (a > 0.5) {
                        arr[i] = 0.5
                    } else {
                        arr[i] = a
                    }
                }


                //arr[i] = 时间ms === 0 ? NaN : (价格均线60[i] - 最低价10[i]) / 时间ms

                if (Math.abs(最低价10[i] - 价格均线60[i]) < 0.01) {
                    ext.last交叉Index = i
                }
            }
        })

        const 下跌速度12 = 指标.EMA(下跌速度, 12, RealDataBase.单位时间)
        const 下跌速度26 = 指标.EMA(下跌速度, 26, RealDataBase.单位时间)
        const 下跌速度DIF = 指标.lazyMapCache(() => Math.max(下跌速度12.length, 下跌速度26.length), i => 下跌速度12[i] - 下跌速度26[i])
        const 下跌速度DEM = 指标.EMA(上涨速度DIF, 9, RealDataBase.单位时间)
        //const 下跌速度OSC = 指标.lazyMapCache(() => Math.max(下跌速度DIF.length, 下跌速度DEM.length), i => 下跌速度DIF[i] - 下跌速度DEM[i])









        return {
            价格, 价格均线, 波动率, 成交量买, 成交量买均线: 成交量买均线30, 成交量卖, 盘口买, 盘口卖, 净盘口, 净盘口均线,
            成交次数买, 成交次数卖,
            阻力1涨, 阻力1跌,
            阻力2涨, 阻力2跌,
            阻力3涨, 阻力3跌,
            阻力4涨, 阻力4跌,
            真空, 真空涨, 真空跌,
            真空信号涨,
            真空信号跌,
            //成交量波动率比值,
            净成交量,
            净成交量均线30,
            成交量均线买1,
            成交量均线卖1,
            成交量均线买5,
            成交量均线卖5,
            成交量买均线30,
            成交量卖均线30,
            // 盘口买均线,
            // 盘口卖均线,
            阻力笔,

            买MACD: {
                DIF,
                DEM,
                OSC,
            },

            卖MACD: {
                DIF1,
                DEM1,
                OSC1,
            },

            信号_上涨,
            信号_下跌,
            上涨价格DIF,
            上涨价格DEM,
            下跌价格DIF,
            下跌价格DEM,
            //价格OSC,

            上涨速度,
            下跌速度,
            价格均线60,
            最高价10,
            最低价10,
            上涨速度DIF,
            上涨速度DEM,
            下跌速度DIF,
            下跌速度DEM,

            阻力3涨DIF,
            阻力3涨DEM,
            阻力3跌DIF,
            阻力3跌DEM,

        }
    }


    private item = (symbol: BaseType.BitmexSymbol, binanceSymbol: BaseType.BinanceSymbol, hopexSymbol: BaseType.HopexSymbol) => {

        const 现货 = this.item2(this.data.binance[binanceSymbol], false)

        const 期货 = this.item2(this.data.bitmex[symbol], true)

        const hopex = this.item2(this.data.hopex[hopexSymbol], false)

        //差价
        const 差价 = 指标.lazyMapCache(() => Math.min(现货.价格.length, 期货.价格.length), i => 现货.价格[i] - 期货.价格[i])
        const 差价均线 = 指标.均线(差价, 300, RealDataBase.单位时间)

        return {
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

    期货盘口dic = new Map<BaseType.BitmexSymbol, BaseType.OrderBook>()
    期货价格dic = new Map<BaseType.BitmexSymbol, number>()

    getOrderPrice = ({ symbol, side, type, 位置 }: { symbol: BaseType.BitmexSymbol, side: BaseType.Side, type: 'taker' | 'maker', 位置: number }) => {
        const p = this.期货盘口dic.get(symbol)
        if (p === undefined) return NaN

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

}