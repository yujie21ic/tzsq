import { JSONSync } from '../lib/C/JSONSync'
import { BaseType } from '../lib/BaseType'
import { sum } from 'ramda'
import { Subject } from 'rxjs'
import { 指标 } from '../lib/指标'
import { Sampling } from '../lib/C/Sampling'
import { kvs } from '../lib/F/kvs'


export class RealDataBase {
    static 单位时间 = 500

    private 删除历史() {
        const length = Math.min(
            this.jsonSync.rawData.bitmex.XBTUSD.data.length,
            this.jsonSync.rawData.bitmex.XBTUSD.orderBook.length,

            this.jsonSync.rawData.bitmex.ETHUSD.data.length,
            this.jsonSync.rawData.bitmex.ETHUSD.orderBook.length,

            this.jsonSync.rawData.binance.btcusdt.data.length,
            this.jsonSync.rawData.binance.btcusdt.orderBook.length,

            this.jsonSync.rawData.binance.ethusdt.data.length,
            this.jsonSync.rawData.binance.ethusdt.orderBook.length,
        )

        //>5000 删除2000
        if (length > 5000) {

            const deleteCount = 2000
            this.jsonSync.rawData.startTick += deleteCount
            this.jsonSync.rawData.bitmex.XBTUSD.data.splice(0, deleteCount)
            this.jsonSync.rawData.bitmex.XBTUSD.orderBook.splice(0, deleteCount)

            this.jsonSync.rawData.bitmex.ETHUSD.data.splice(0, deleteCount)
            this.jsonSync.rawData.bitmex.ETHUSD.orderBook.splice(0, deleteCount)

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


        const 成交量买 = 指标.lazyMapCache(() => data.length, i => data[i].buySize)
        const 成交量卖 = 指标.lazyMapCache(() => data.length, i => data[i].sellSize)

        const 成交次数买 = 指标.lazyMapCache(() => data.length, i => data[i].buyCount)
        const 成交次数卖 = 指标.lazyMapCache(() => data.length, i => data[i].sellCount)
        const 成交量均线买3 = 指标.累加(
            指标.lazyMapCache(() => 成交量买.length, i => 成交量买[i]),
            3,
            RealDataBase.单位时间
        )
        const 成交量均线卖3 = 指标.累加(
            指标.lazyMapCache(() => 成交量卖.length, i => 成交量卖[i]),
            3,
            RealDataBase.单位时间
        )
        const 成交次数买均线10 = 指标.累加(
            指标.lazyMapCache(() => 成交次数买.length, i => 成交次数买[i]),
            5,
            RealDataBase.单位时间
        )
        const 成交次数卖均线10 = 指标.累加(
            指标.lazyMapCache(() => 成交次数卖.length, i => 成交次数卖[i]),
            5,
            RealDataBase.单位时间
        )

        const 成交量买均线1 = 指标.累加(
            指标.lazyMapCache(() => 成交量买.length, i => 成交量买[i]),
            多少秒均线,
            RealDataBase.单位时间
        )
        const 成交量卖均线1 = 指标.累加(
            指标.lazyMapCache(() => 成交量卖.length, i => Math.abs(成交量卖[i])),
            多少秒均线,
            RealDataBase.单位时间
        )
        // const 成交量均线1 = 指标.累加(
        //     指标.lazyMapCache(() => Math.min(成交量买.length, 成交量卖.length), i => Math.max(成交量买均线1[i],成交量卖均线1[i])-Math.min(成交量买均线1[i],成交量卖均线1[i]) ),
        //     多少秒均线,
        //     RealDataBase.单位时间
        // )
        const 成交量均线1 = 指标.lazyMapCache(() => data.length, i => Math.max(成交量买均线1[i], 成交量卖均线1[i]) - Math.min(成交量买均线1[i], 成交量卖均线1[i]))
        const 成交量次数均线1 = 指标.累加(
            指标.lazyMapCache(() => Math.min(成交次数买.length, 成交次数卖.length), i => data[i].buyCount + data[i].sellCount),
            多少秒均线,
            RealDataBase.单位时间
        )
        const 成交量买均线 = 指标.均线(成交量买, 多少秒均线, RealDataBase.单位时间)
        const 成交量卖均线 = 指标.均线(成交量卖, 多少秒均线, RealDataBase.单位时间)

        const 盘口买 = 指标.lazyMapCache(() => orderBook.length, i => sum(orderBook[i].buy.map(v => v.size)))
        const 盘口卖 = 指标.lazyMapCache(() => orderBook.length, i => sum(orderBook[i].sell.map(v => v.size)))
        // const 盘口买均线 = 指标.均线(
        //     指标.lazyMapCache(() => 盘口买.length, i => 盘口买[i]),
        //     150,
        //     RealDataBase.单位时间
        // )    
        // const 盘口卖均线 = 指标.均线(
        //     指标.lazyMapCache(() => 盘口卖.length, i => 盘口卖[i]),
        //     150,
        //     RealDataBase.单位时间
        // )   
        const 净盘口 = 指标.lazyMapCache(() => Math.min(盘口买.length, 盘口卖.length), i => 盘口买[i] - Math.abs(盘口卖[i]))
        const 净盘口均线 = 指标.均线(
            指标.lazyMapCache(() => Math.min(盘口买.length, 盘口卖.length), i => (盘口买[i] + 盘口卖[i]) / 2),
            多少秒均线,
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
        const 真空信号涨 = 指标.lazyMapCache(() => 阻力3.length, i => (阻力3[i].阻力 < 100000 && 阻力3[i].阻力 > 0 && 阻力3[i].价钱增量 > 30) ? 1 : 0)
        const 真空信号跌 = 指标.lazyMapCache(() => 阻力3.length, i => (阻力3[i].阻力 < 0 && 阻力3[i].阻力 > -100000 && 阻力3[i].价钱增量 > 30) ? 1 : 0)

        const 阻力笔 = 指标.阻力笔(价格)

        return {
            价格, 价格均线, 波动率, 成交量买, 成交量买均线, 成交量卖, 成交量卖均线, 盘口买, 盘口卖, 净盘口, 净盘口均线,
            成交次数买, 成交次数卖,
            阻力1涨, 阻力1跌,
            阻力2涨, 阻力2跌,
            阻力3涨, 阻力3跌,
            阻力4涨, 阻力4跌,
            真空, 真空涨, 真空跌,
            真空信号涨,
            真空信号跌,
            //成交量波动率比值,
            成交量均线1,
            成交量买均线1,
            成交量卖均线1,
            成交量次数均线1,
            成交量均线买3,
            成交量均线卖3,
            成交次数买均线10,
            成交次数卖均线10,
            // 盘口买均线,
            // 盘口卖均线,
            阻力笔,
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

    //
    priceObservable = new Subject<{
        symbol: string
        price: number
    }>()

    期货盘口dic = new Map<BaseType.BitmexSymbol, BaseType.OrderBook>()
    现货价格dic = new Map<BaseType.BinanceSymbol, number>()
    期货价格dic = new Map<BaseType.BitmexSymbol, number>()

    getOrderPrice = (symbol: BaseType.BitmexSymbol, side: BaseType.Side, type: 'taker' | 'maker') => {
        const p = this.期货盘口dic.get(symbol)
        if (p === undefined) return NaN

        if (side === 'Buy') {
            if (type === 'taker') {
                return p.sell[0] ? p.sell[0].price : NaN
            } else {
                return p.buy[0] ? p.buy[0].price : NaN
            }
        } else if (side === 'Sell') {
            if (type === 'taker') {
                return p.buy[0] ? p.buy[0].price : NaN
            } else {
                return p.sell[0] ? p.sell[0].price : NaN
            }
        } else {
            return NaN
        }
    }

}