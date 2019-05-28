import { JSONSync } from '../F/JSONSync'
import { BaseType } from '../BaseType'
import { 指标 } from '../指标/指标'
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
    data: [] as BaseType.KLine[],
    orderBook: [] as BaseType.OrderBook[],
})

export class RealDataBase {

    //________________________________________________________________________________________________//
    jsonSync = new JSONSync(
        {
            startTick: 0,
            ctp: mapObjIndexed(createItem, BaseType.CTPSymbolDic),
            hopex: mapObjIndexed(createItem, BaseType.HopexSymbolDic),
            ix: mapObjIndexed(createItem, BaseType.IXSymbolDic),
            bitmex: mapObjIndexed(createItem, BaseType.BitmexSymbolDic),
            deribit: mapObjIndexed(createItem, BaseType.DeribitSymbolDic),
        }
    )

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

    get data() {
        return this.jsonSync.rawData
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
        data: BaseType.KLine[]
        orderBook: BaseType.OrderBook[]
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


        const 价格_波动率30 = 指标.波动率(价格, 30, RealDataBase.单位时间)
        const 价格_波动率60 = 指标.波动率(价格, 60, RealDataBase.单位时间)
        const 价格_波动率300 = 指标.波动率(价格, 300, RealDataBase.单位时间)

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

            时间str,

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
            价格_均线300,
            净成交量abs_macd,
            价格,
            价格_波动率30,


            价格_最高60,
            价格_最低60,
            价格_最高60_价差,
        }
    }
}