import { JSONSync } from '../F/JSONSync'
import { BaseType } from '../BaseType'
import { 指标 } from '../指标/指标'
import { toRange } from '../F/toRange'
import { timeID } from '../F/timeID'
import { get买卖 } from '../指标/买卖'
import { formatDate } from '../F/formatDate'
import { mapObjIndexed } from '../F/mapObjIndexed'
import { CTPTradeAndOrderBook } from './TradeAndOrderBook/CTPTradeAndOrderBook'
import { BitmexTradeAndOrderBook } from './TradeAndOrderBook/BitmexTradeAndOrderBook'
import { HopexTradeAndOrderBook } from './TradeAndOrderBook/HopexTradeAndOrderBook'
import { IXTradeAndOrderBook } from './TradeAndOrderBook/IXTradeAndOrderBook'
import { TradeAndOrderBook } from './TradeAndOrderBook/TradeAndOrderBook'
import { DeribitTradeAndOrderBook } from './TradeAndOrderBook/DeribitTradeAndOrderBook'



const createItem = () => ({
    // 着笔: [] as BaseType.着笔[], 


    //合起来 ???????
    data: [] as BaseType.KLine[],

    orderBook: [] as BaseType.OrderBook[],

    //最后一个被吃的价  和  量
    吃单情况: [] as {
        买: {
            价: number
            被吃量: number
        },
        卖: {
            价: number
            被吃量: number
        }
    }[],
})

export class RealDataBase {

    //________________________________________________________________________________________________//
    jsonSync = new JSONSync(
        {
            startTick: 0,//tick的  1m的开始 没有对齐
            ctp: mapObjIndexed(createItem, BaseType.CTPSymbolDic),
            hopex: mapObjIndexed(createItem, BaseType.HopexSymbolDic),
            ix: mapObjIndexed(createItem, BaseType.IXSymbolDic),
            bitmex: mapObjIndexed(createItem, BaseType.BitmexSymbolDic),
            deribit: mapObjIndexed(createItem, BaseType.DeribitSymbolDic),
        }
    )

    // private item = (symbol: BaseType.BitmexSymbol, hopexSymbol: BaseType.HopexSymbol) => {
    //     const bitmex = this.item2(this.data.bitmex[symbol], true)
    //     const hopex = this.item2(this.data.hopex[hopexSymbol], true)
    //     const hopex_bitmex_差价 = 指标.map(() => Math.min(hopex.价格.length, bitmex.价格.length), i => hopex.价格[i] - bitmex.价格[i])
    //     const hopex_bitmex_差价均线 = 指标.SMA(hopex_bitmex_差价, 300, RealDataBase.单位时间)
    //     const hopex_bitmex_相对差价 = 指标.map(() => Math.min(hopex.价格.length, bitmex.价格.length), i => hopex_bitmex_差价[i] - hopex_bitmex_差价均线[i])
    //     return {
    //         hopex_bitmex_相对差价,
    //         bitmex,
    //         hopex,
    //     }
    // }

    CREATE = () => ({
        期货30秒内成交量: (symbol: BaseType.BitmexSymbol) => this.get期货多少秒内成交量__万为单位(symbol, 30),
        ctp: mapObjIndexed((v, k) => this.item2(this.data.ctp[k], true), BaseType.CTPSymbolDic),
        bitmex: mapObjIndexed((v, k) => this.item2(this.data.bitmex[k], false), BaseType.BitmexSymbolDic),
        hopex: mapObjIndexed((v, k) => this.item2(this.data.hopex[k], false), BaseType.HopexSymbolDic),
        ix: mapObjIndexed((v, k) => this.item2(this.data.ix[k], false), BaseType.IXSymbolDic),
        deribit: mapObjIndexed((v, k) => this.item2(this.data.deribit[k], false), BaseType.DeribitSymbolDic),
    })

    dataExt = this.CREATE()

    重新初始化 = () => this.dataExt = this.CREATE()

    getTradeAndOrderBookArr = () => [
        new CTPTradeAndOrderBook(),
        new BitmexTradeAndOrderBook(),
        new HopexTradeAndOrderBook(),
        new IXTradeAndOrderBook(),
        new DeribitTradeAndOrderBook(),
    ] as TradeAndOrderBook<any>[]
    //________________________________________________________________________________________________//





    static 单位时间 = 500

    删除历史() {

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


    private item2(xxx: {
        //着笔: BaseType.着笔[]
        data: BaseType.KLine[]
        orderBook: BaseType.OrderBook[]
        吃单情况: {
            买: {
                价: number;
                被吃量: number;
            };
            卖: {
                价: number;
                被吃量: number;
            };
        }[]
    }, 盘口算价格: boolean) {
        盘口算价格 = false
        const { data, orderBook } = xxx

        const 收盘价 = 指标.map(() => data.length, i => data[i].close)

        盘口算价格 = false

        const 盘口价格 = 指标.map(() => orderBook.length, i =>
            (orderBook[i].buy && orderBook[i].buy.length > 0 && orderBook[i].sell && orderBook[i].sell.length > 0) ?
                ((orderBook[i].buy[0].price + orderBook[i].sell[0].price) / 2) : NaN)



        const 价格 = 盘口算价格 ? 盘口价格 : 收盘价

        const 时间 = 指标.map(() => data.length, i => timeID._500ms.toTimestamp(data[i].id))

        const 时间str = 指标.map(() => 时间.length, i => formatDate(new Date(时间[i]), v => `${v.hh}:${v.mm}:${v.ss}:${v.msmsms}`))
        const 价格macd = 指标.macd(价格, RealDataBase.单位时间)



        const 被动_卖均价_300 = 指标.map(() => Math.min(data.length, 卖.盘口1价.length), i => {
            if (i >= 600) {
                let sum = 0
                let vol = 0
                for (let k = i - 600; k <= i; k++) {
                    vol += data[k].buySize
                    sum += data[k].buySize * 卖.盘口1价[k]
                }
                return sum / vol
            } else {
                return NaN
            }
        })

        const 被动_买均价_300 = 指标.map(() => Math.min(data.length, 买.盘口1价.length), i => {
            if (i >= 600) {
                let sum = 0
                let vol = 0
                for (let k = i - 600; k <= i; k++) {
                    vol += data[k].sellSize
                    sum += data[k].sellSize * 买.盘口1价[k]
                }
                return sum / vol
            } else {
                return NaN
            }
        })



        //
        const __波动_测试 = 指标.map2({ index: 0, lastPrice: NaN }, (arr: {
            价格: number
            买1价: number
            卖1价: number
            时间: number
            时间str: string
            持续秒: number
            累计买: number
            累计卖: number
        }[], ext) => {
            while (ext.index < Math.min(盘口价格.length - 1, 买.成交量.length - 1)) {//延迟一个显示  先

                const { buy, sell } = orderBook[ext.index]
                const 买1价 = buy.length > 0 ? buy[0].price : NaN
                const 卖1价 = sell.length > 0 ? sell[0].price : NaN

                if (ext.lastPrice !== 盘口价格[ext.index]) {
                    ext.lastPrice = 盘口价格[ext.index]
                    arr.push({
                        价格: 盘口价格[ext.index],
                        买1价,
                        卖1价,
                        时间: 时间[ext.index],
                        时间str: new Date(时间[ext.index]).toLocaleString(),
                        持续秒: 0.5,
                        累计买: 买.成交量[ext.index],
                        累计卖: 卖.成交量[ext.index],
                    })
                } else {
                    arr[arr.length - 1] = ({
                        价格: arr[arr.length - 1].价格,
                        买1价,
                        卖1价,
                        时间: arr[arr.length - 1].时间,
                        时间str: arr[arr.length - 1].时间str,
                        持续秒: arr[arr.length - 1].持续秒 + 0.5,
                        累计买: arr[arr.length - 1].累计买 + 买.成交量[ext.index],
                        累计卖: arr[arr.length - 1].累计卖 + 卖.成交量[ext.index],
                    })
                }
                ext.index++
            }
        })

        const 波动_测试_净成交量 = 指标.map(() => __波动_测试.length, i => __波动_测试[i].累计买 - __波动_测试[i].累计卖)
        const 波动_测试_净成交量_累加10 = 指标.累加(波动_测试_净成交量, 10, 1000)

        const 波动_测试 = {
            价格: 指标.map(() => __波动_测试.length, i => __波动_测试[i].价格),
            时间: 指标.map(() => __波动_测试.length, i => __波动_测试[i].时间),
            时间str: 指标.map(() => __波动_测试.length, i => __波动_测试[i].时间str),
            持续秒: 指标.map(() => __波动_测试.length, i => __波动_测试[i].持续秒),
            累计买: 指标.map(() => __波动_测试.length, i => __波动_测试[i].累计买),
            累计卖: 指标.map(() => __波动_测试.length, i => __波动_测试[i].累计卖),
            净成交量: 波动_测试_净成交量,
            净成交量_累加10: 波动_测试_净成交量_累加10,
            买均价_10: 指标.map(() => __波动_测试.length, i => {
                if (i >= 9) {
                    let sum = 0
                    let vol = 0
                    for (let k = i - 9; k <= i; k++) {
                        vol += __波动_测试[k].累计买
                        sum += __波动_测试[k].累计买 * __波动_测试[k].卖1价
                    }
                    return sum / vol
                } else {
                    return NaN
                }
            }),
            卖均价_10: 指标.map(() => __波动_测试.length, i => {
                if (i >= 9) {
                    let sum = 0
                    let vol = 0
                    for (let k = i - 9; k <= i; k++) {
                        vol += __波动_测试[k].累计卖
                        sum += __波动_测试[k].累计卖 * __波动_测试[k].买1价
                    }
                    return sum / vol
                } else {
                    return NaN
                }
            }),
        }

        const KLine = 指标.map(() => data.length, i => ({
            open: data[i].open,
            high: data[i].high,
            low: data[i].low,
            close: data[i].close,
        }))

        const { 买, 卖 } = get买卖({ data, orderBook })

        //价格
        const 价格_均线300 = 指标.SMA(价格, 300, RealDataBase.单位时间)
        const 价格_均线120 = 指标.SMA(价格, 120, RealDataBase.单位时间)
        const 价格_均线13 = 指标.SMA(价格, 13, RealDataBase.单位时间)
        const 价格_均线20 = 指标.SMA(价格, 20, RealDataBase.单位时间)
        const 价格_均线34 = 指标.SMA(价格, 34, RealDataBase.单位时间)
        const 价格_均线89 = 指标.SMA(价格, 89, RealDataBase.单位时间)
        const 价格_均线144 = 指标.SMA(价格, 144, RealDataBase.单位时间)
        const 价格_均线12 = 指标.SMA(价格, 12, RealDataBase.单位时间)
        const 价格_均线60 = 指标.SMA(价格, 60, RealDataBase.单位时间)
        const 价格均线价差 = 指标.map(() => Math.min(价格_均线300.length, 价格_均线120.length), i => 价格_均线120[i] - 价格_均线300[i])

        const bitmex_价格_macd = 指标.macd带参数(价格, 36, 78, 27, RealDataBase.单位时间)
        const 价格_波动率30 = 指标.波动率(价格, 30, RealDataBase.单位时间)
        const 价格_波动率60 = 指标.波动率(价格, 60, RealDataBase.单位时间)
        const 价格_波动率300 = 指标.波动率(价格, 300, RealDataBase.单位时间)

       

        const 折返率 = 指标.map(() => 价格_波动率30.length, i => toRange({ min: 4, max: 15, value: 价格_波动率30[i] / 10 }))

        //净成交量abs
        const 净成交量abs = 指标.map(() => Math.min(买.成交量.length, 卖.成交量.length), i => 买.成交量[i] - 卖.成交量[i])
        const 净成交量abs原始 = 指标.map(() => Math.min(买.成交量.length, 卖.成交量.length), i => Math.abs(买.成交量[i] - 卖.成交量[i]))

        const 净成交量abs_累加5 = 指标.累加(净成交量abs, 5, RealDataBase.单位时间)
        const 净成交量abs_macd = 指标.macd(净成交量abs原始, RealDataBase.单位时间)

        //
        const 价格_最高60 = 指标.最高(价格, 60, RealDataBase.单位时间)
        const 价格_最低60 = 指标.最低(价格, 60, RealDataBase.单位时间)
        const 价格_最高60_价差 = 指标.map(() => Math.min(买.成交量.length, 卖.成交量.length), i => 价格_最高60[i] - 价格[i])
        const 动态价格_均线 = 指标.SMA(价格, 7, RealDataBase.单位时间)




        const [双开, 双平, 多换, 空换, 多平, 空平, 空开, 多开] = ['双开', '双平', '多换', '空换', '多平', '空平', '空开', '多开'].map(v =>
            指标.map(() => data.length, i => data[i].成交性质 === v ? data[i].buySize + data[i].sellSize : 0)
        )
        const 成交性质 = { 双开, 双平, 多换, 空换, 多平, 空平, 空开, 多开 }



        return {
            吃单情况: xxx.吃单情况,


            吃单情况_买_被吃量: 指标.map(() => xxx.吃单情况.length, i => xxx.吃单情况[i].买.被吃量),
            吃单情况_卖_被吃量: 指标.map(() => xxx.吃单情况.length, i => xxx.吃单情况[i].卖.被吃量),

            盘口买1加被吃的: 指标.map(() => Math.min(买.盘口1.length, xxx.吃单情况.length), i => 买.盘口1[i] + xxx.吃单情况[i].买.被吃量),
            盘口卖1加被吃的: 指标.map(() => Math.min(卖.盘口1.length, xxx.吃单情况.length), i => 卖.盘口1[i] + xxx.吃单情况[i].卖.被吃量),

            盘口买加主动买: 指标.map(() => Math.min(买.盘口1.length, xxx.吃单情况.length), i => 买.盘口1[i] + xxx.吃单情况[i].卖.被吃量),
            盘口卖加主动卖: 指标.map(() => Math.min(卖.盘口1.length, xxx.吃单情况.length), i => 卖.盘口1[i] + xxx.吃单情况[i].买.被吃量),

            价格乘以ln净成交量: 指标.map(() => Math.min(收盘价.length, 买.成交量_累加60.length), i => 收盘价[i] * Math.log(买.净成交量_累加60[i])),
            价格乘以ln主动买: 指标.map(() => Math.min(收盘价.length, 买.成交量_累加60.length), i => 收盘价[i] * Math.log(买.成交量_累加60[i])),
            价格乘以ln主动卖: 指标.map(() => Math.min(收盘价.length, 卖.成交量_累加60.length), i => 收盘价[i] * Math.log(卖.成交量_累加60[i])),


            价格_均线13,
            价格_均线34,
            价格_均线20,
            价格_均线89,
            价格_均线144,
            价格_均线12,
            价格_均线60, 
            价格macd,
            bitmex_价格_macd, 

            时间str,
            波动_测试,



            价格均线价差,
            价格_均线120,
            价格_波动率60,
            动态价格_均线,
            成交性质,
            KLine,
            净成交量abs_累加5,
            买,
            卖,
            收盘价,
            盘口: orderBook,
            时间,
            价格_波动率300,
            折返率,
            价格_均线300,
            净成交量abs_macd,
            价格,
            价格_波动率30,


            价格_最高60,
            价格_最低60,
            价格_最高60_价差,
            被动_买均价_300,
            被动_卖均价_300,
        }
    }
}