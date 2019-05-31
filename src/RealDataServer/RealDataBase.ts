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
import { kvs } from '../F/kvs'

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
            binance: mapObjIndexed(createItem, BaseType.BinanceSymbolDic),
        }
    )

    CREATE = () => ({
        期货30秒内成交量: (symbol: BaseType.BitmexSymbol) => this.get期货多少秒内成交量__万为单位(symbol, 30),
        ctp: mapObjIndexed((v, k) => this.item2(this.data.ctp[k], false), BaseType.CTPSymbolDic),
        bitmex: mapObjIndexed((v, k) => this.item2(this.data.bitmex[k], false), BaseType.BitmexSymbolDic),
        hopex: mapObjIndexed((v, k) => this.item2(this.data.hopex[k], false), BaseType.HopexSymbolDic),
        ix: mapObjIndexed((v, k) => this.item2(this.data.ix[k], false), BaseType.IXSymbolDic),
        deribit: mapObjIndexed((v, k) => this.item2(this.data.deribit[k], false), BaseType.DeribitSymbolDic),
        binance: mapObjIndexed((v, k) => this.item2(this.data.binance[k], false), BaseType.BinanceSymbolDic),
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

    删除历史() {
        const arr: any[] = []

        kvs(this.jsonSync.rawData).forEach(({ k, v }: any) => {
            if (k !== 'startTick' && k !== 'ctp') {
                kvs(v).forEach(({ v }) => arr.push(v))
            }
        })

        let length = Math.min(arr[0].data.length, arr[0].orderBook.length)
        arr.forEach(v => {
            length = Math.min(length, Math.min(v.data.length, v.orderBook.length))
        })


        if (length > 50000 * 2) {

            const deleteCount = 25000 * 2
            this.jsonSync.rawData.startTick += deleteCount

            arr.forEach(v => {
                v.data.splice(0, deleteCount)
                v.orderBook.splice(0, deleteCount)
            })

            this.重新初始化() //卡死？
        }

    }
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

        const 盘口价格 = 指标.map(() => orderBook.length, i =>
            (orderBook[i].buy && orderBook[i].buy.length > 0 && orderBook[i].sell && orderBook[i].sell.length > 0) ?
                ((orderBook[i].buy[0].price + orderBook[i].sell[0].price) / 2) : NaN)

        const 价格 = 盘口算价格 ? 盘口价格 : 收盘价

        const 时间 = 指标.map(() => data.length, i => timeID._500ms.toTimestamp(data[i].id))
        const 时间str = 指标.map(() => 时间.length, i => formatDate(new Date(时间[i]), v => `${v.hh}:${v.mm}:${v.ss}:${v.msmsms}`))

        const KLine = 指标.map(() => data.length, i => ({
            open: data[i].open,
            high: data[i].high,
            low: data[i].low,
            close: data[i].close,
        }))

        const { 买, 卖 } = get买卖({ data, orderBook })
        const 价格_波动率30 = 指标.波动率(价格, 30, RealDataBase.单位时间)

        const [双开, 双平, 多换, 空换, 多平, 空平, 空开, 多开] = ['双开', '双平', '多换', '空换', '多平', '空平', '空开', '多开'].map(v =>
            指标.map(() => data.length, i => data[i].成交性质 === v ? data[i].buySize + data[i].sellSize : 0)
        )
        const 成交性质 = { 双开, 双平, 多换, 空换, 多平, 空平, 空开, 多开 }

        return {
            时间,
            时间str,
            成交性质,
            KLine,
            买,
            卖,
            收盘价,
            盘口: orderBook,
            价格,
            价格_波动率30,
        }
    }
}