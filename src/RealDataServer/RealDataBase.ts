import { JSONSync } from '../lib/F/JSONSync'
import { BaseType } from '../lib/BaseType'
import { 指标 } from '../指标/指标'
import { toRange } from '../lib/F/toRange' 
import { timeID } from '../lib/F/timeID'
import { get买卖 } from '../指标/买卖'
import { formatDate } from '../lib/F/formatDate'
import { mapObjIndexed } from '../lib/F/mapObjIndexed'
import { ______CTP__config } from './______CTP__config'

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
    static 单位时间 = 500

    删除历史() {

    }

    get data() {
        return this.jsonSync.rawData
    }


    jsonSync = new JSONSync(
        {
            startTick: 0,//tick的  1m的开始 没有对齐
            ctp: mapObjIndexed(createItem, ______CTP__config),
            hopex: mapObjIndexed(createItem, BaseType.HopexSymbolDic),
            ix: mapObjIndexed(createItem, BaseType.IXSymbolDic),
            bitmex: mapObjIndexed(createItem, BaseType.BitmexSymbolDic),
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

        const 映射到其他周期 = (n: number) => 指标.map(
            () => {
                if (data.length === 0) return 0
                const 多出 = n - data[0].id % n
                return Math.ceil(data.length / n) + 多出 === n ? 0 : 1
            },
            i => {
                const 多出 = n - data[0].id % n
                const index = Math.min(data.length - 1, 多出 + i * n - 1)
                return data[index]
            }
        )

        const 映射回500ms = <T>(n: number, arr: ArrayLike<T>) => 指标.map(
            () => data.length,
            i => {
                const 多出 = n - data[0].id % n
                const index = Math.ceil((i - 多出) / n)
                return arr[index]
            }
        )



        const 映射到其他周期_close = (n: number) => {
            const arr = 映射到其他周期(n)
            return 指标.map(() => arr.length, i => arr[i].close)
        }

        const _20s价格 = 映射到其他周期_close(20 * 2)
        const _12s价格 = 映射到其他周期_close(12 * 2)
        const _13s价格 = 映射到其他周期_close(13 * 2)
        const _60s价格 = 映射到其他周期_close(60 * 2)
        const _300s价格 = 映射到其他周期_close(300 * 2)

        const _12s_ = {
            macd: 指标.macd(_12s价格, 1000),
            布林带: 指标.布林带(_12s价格, 1000),
        }
        const _13s_ = {
            布林带: 指标.布林带(_13s价格, 1000),
        }
        const _20s_ = {
            布林带: 指标.布林带(_20s价格, 1000),
        }


        const _60s_ = {
            macd: 指标.macd(_60s价格, 1000),
            布林带: 指标.布林带(_60s价格, 1000),
        }

        const _300s_ = {
            macd: 指标.macd(_300s价格, 1000),
            布林带: 指标.布林带(_300s价格, 1000),
        }

        const _12s_macd = {
            DIF: 映射回500ms(12 * 2, _12s_.macd.DIF),
            DEM: 映射回500ms(12 * 2, _12s_.macd.DEM),
            OSC: 映射回500ms(12 * 2, _12s_.macd.OSC),
        }
        const _20s_布林 = {
            上轨: 映射回500ms(20 * 2, _20s_.布林带.上轨),
            中轨: 映射回500ms(20 * 2, _20s_.布林带.中轨),
            下轨: 映射回500ms(20 * 2, _20s_.布林带.下轨),
        }
        const _13s_布林 = {
            上轨: 映射回500ms(13 * 2, _13s_.布林带.上轨),
            中轨: 映射回500ms(13 * 2, _13s_.布林带.中轨),
            下轨: 映射回500ms(13 * 2, _13s_.布林带.下轨),
        }

        const _60s_macd = {
            DIF: 映射回500ms(60 * 2, _60s_.macd.DIF),
            DEM: 映射回500ms(60 * 2, _60s_.macd.DEM),
            OSC: 映射回500ms(60 * 2, _60s_.macd.OSC),
        }

        const _300s_macd = {
            DIF: 映射回500ms(300 * 2, _300s_.macd.DIF),
            DEM: 映射回500ms(300 * 2, _300s_.macd.DEM),
            OSC: 映射回500ms(300 * 2, _300s_.macd.OSC),
        }

        //着笔
        // （当前时间-这个价位开始的时间）*1（上涨）
        // （当前时间-这个价位开始的时间）*-1（下跌）
        // 然后相加这个价位笔的加权计算，最终是正数，就是上涨，负数就是下跌
        // const 着笔 = {
        //     timestamp: 指标.map(() => xxx.着笔.length, i => xxx.着笔[i].timestamp),
        //     _500ms_id: 指标.map(() => xxx.着笔.length, i => timeID._500ms.toID(xxx.着笔[i].timestamp)),
        //     price: 指标.map(() => xxx.着笔.length, i => xxx.着笔[i].price),
        //     side: 指标.map(() => xxx.着笔.length, i => xxx.着笔[i].side),
        //     size: 指标.map(() => xxx.着笔.length, i => xxx.着笔[i].size),
        //     涨跌: 指标.map(() => xxx.着笔.length, i => {
        //         let c = 0
        //         for (let k = i; k >= Math.max(0, i - 50); k--) {
        //             if (xxx.着笔[k].price === xxx.着笔[k].buy1) {
        //                 c += (i - k)
        //             }
        //             else if (xxx.着笔[k].price === xxx.着笔[k].sell1) {
        //                 c -= (i - k)
        //             }
        //             else {
        //                 break
        //             }
        //         }
        //         return c > 0 ? 1 : -1
        //     }),
        // }




        //500ms

        // const 着笔涨跌 = 指标.map(
        //     () => data.length - 10,
        //     i => {
        //         let n = 0

        //         for (let k = 着笔._500ms_id.length - 1; k >= 0; k--) {
        //             if (着笔._500ms_id[k] === data[i].id) {
        //                 n = 着笔.涨跌[k]
        //                 break
        //             }
        //         }

        //         return [
        //             { name: '涨', value: n === 1, color: 0x0E6655 },
        //             { name: '跌', value: n === -1, color: 0x943126 },

        //         ]
        //     })

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

        const 价格_波动率15 = 指标.波动率(价格, 15, RealDataBase.单位时间)
        const 价格_波动率30 = 指标.波动率(价格, 30, RealDataBase.单位时间)
        const 价格_波动率60 = 指标.波动率(价格, 60, RealDataBase.单位时间)
        const 价格_波动率300 = 指标.波动率(价格, 300, RealDataBase.单位时间)

        const tick力量指数12 = 指标.map(() => Math.min(_12s_macd.DIF.length, 买.净成交量_累加12.length), i => (买.净成交量_累加12[i] / 100000) * _12s_macd.OSC[i])
        const tick力量指数60 = 指标.map(() => Math.min(_60s_macd.DIF.length, 买.净成交量_累加60.length), i => (买.净成交量_累加60[i] / 100000) * _60s_macd.OSC[i])


        const 折返率 = 指标.map(() => 价格_波动率30.length, i => toRange({ min: 4, max: 15, value: 价格_波动率30[i] / 10 }))

        //净成交量abs
        const 净成交量abs = 指标.map(() => Math.min(买.成交量.length, 卖.成交量.length), i => 买.成交量[i] - 卖.成交量[i])
        const 净成交量abs原始 = 指标.map(() => Math.min(买.成交量.length, 卖.成交量.length), i => Math.abs(买.成交量[i] - 卖.成交量[i]))

        const 净成交量abs_累加5 = 指标.累加(净成交量abs, 5, RealDataBase.单位时间)
        const 净成交量abs_macd = 指标.macd(净成交量abs原始, RealDataBase.单位时间)

        //阻力3
        const __阻力3 = 指标.阻力3({ price: 价格, volumeBuy: 买.成交量, volumeSell: 卖.成交量, })
        const 阻力3涨 = 指标.map(() => __阻力3.length, i => Math.max(0, __阻力3[i].阻力))
        const 阻力3跌 = 指标.map(() => __阻力3.length, i => Math.min(0, __阻力3[i].阻力))
        const 真空信号涨 = 指标.map(() => 价格.length, i => (__阻力3[i].阻力 < 150000) && __阻力3[i].阻力 > 0 && __阻力3[i].价钱增量 >= toRange({ min: 4, max: 12, value: 价格_波动率30[i] / 10 }))
        const 真空信号跌 = 指标.map(() => 价格.length, i => (__阻力3[i].阻力 > -150000) && __阻力3[i].阻力 < 0 && __阻力3[i].价钱增量 >= toRange({ min: 4, max: 12, value: 价格_波动率30[i] / 10 }))

        //上涨_下跌
        //const 上涨_下跌 = 指标.lazyMapCache(() => Math.min(买.净成交量_累加60.length), i => 买.净成交量_累加60[i] >= 0 ? '上涨' : '下跌')
        const 上涨_下跌_横盘 = 指标.map(
            () => Math.min(买.净成交量_累加60.length),
            i => {
                if (买.净成交量_累加60[i] >= 10 * 10000) {
                    return '上涨'
                } else if (买.净成交量_累加60[i] <= -10 * 10000) {
                    return '下跌'
                } else {
                    return '横盘'
                }
            })
        const 上涨_下跌_横盘追涨追跌专用 = 指标.map(
            () => Math.min(买.净成交量_累加60.length),
            i => {
                if (买.净成交量_累加60[i] >= -10 * 10000) {
                    return '上涨'
                } else if (买.净成交量_累加60[i] <= 10 * 10000) {
                    return '下跌'
                } else {
                    return '横盘'
                }
            })

        //
        const 价格_最高60 = 指标.最高(价格, 60, RealDataBase.单位时间)
        const 价格_最低60 = 指标.最低(价格, 60, RealDataBase.单位时间)
        const 价格_最高60_价差 = 指标.map(() => Math.min(买.成交量.length, 卖.成交量.length), i => 价格_最高60[i] - 价格[i])



        //________________上涨_下跌_分开_的 全用这个 返回______________________
        //引用 统一 上涨.xxx 下跌.xxx


        const 上涨_下跌_分开_的 = (type: '上涨' | '下跌') => {

            const 累计成交量 = 指标.map2({ 累计成交量: NaN }, (arr: number[], ext) => {
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

            const 价差 = 指标.map2({ 起点价格: NaN }, (arr: number[], ext) => {
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

            const 动力 = 指标.map(
                () => Math.min(累计成交量.length, 价差.length),
                i => toRange({ min: 30 * 10000, max: 130 * 10000, value: 累计成交量[i] / Math.max(1, 价差[i]) }) //最小除以1
            )


            const 动态时间_x秒 = 指标.map(
                () => Math.min(价差.length),
                i => toRange({ min: 15, max: 20, value: 价差[i] / 10 }),
            )
            const 动态时间_小y秒 = 指标.map(
                () => Math.min(价差.length),
                i => toRange({ min: 3, max: 10, value: 价差[i] / 14 }),
            )

            const 动态时间_y秒 = 指标.map(
                () => Math.min(价差.length),
                i => toRange({ min: 4, max: 10, value: 价差[i] / 12 }),
            )

            const 动态时间_y秒大 = 指标.map(
                () => Math.min(价差.length),
                i => toRange({ min: 6, max: 15, value: 价差[i] / 6 }),
            )

            const x秒内极值点价格 = 指标.map(
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
            const 价差走平hopex = 指标.map(
                () => Math.min(动态时间_小y秒.length, 价格.length, x秒内极值点价格.length),
                i => {
                    //1秒2根
                    const y根 = 动态时间_小y秒[i] * 2
                    if (isNaN(y根)) return false
                    const 极值 = x秒内极值点价格[Math.max(0, i - y根 + 1)]
                    for (let k = i; k > Math.max(-1, i - y根); k--) {
                        if (type === '上涨' && 价格[k] > (极值 + (价差[i] > 50 ? 1 : 0))) {//继续创新高
                            return false
                        }

                        if (type === '下跌' && 价格[k] < (极值 - (价差[i] > 50 ? 1 : 0))) {//继续创新低
                            return false
                        }
                    }
                    return true
                }
            )

            //y秒
            const 价差走平 = 指标.map(
                () => Math.min(动态时间_y秒.length, 价格.length, x秒内极值点价格.length),
                i => {
                    //1秒2根
                    const y根 = 动态时间_y秒[i] * 2
                    if (isNaN(y根)) return false
                    const 极值 = x秒内极值点价格[Math.max(0, i - y根 + 1)]
                    for (let k = i; k > Math.max(-1, i - y根); k--) {
                        if (type === '上涨' && 价格[k] > (极值 + (价差[i] > 50 ? 1 : 0))) {//继续创新高
                            return false
                        }

                        if (type === '下跌' && 价格[k] < (极值 - (价差[i] > 50 ? 1 : 0))) {//继续创新低
                            return false
                        }
                    }
                    return true
                }
            )
            const 价差走平4s = 指标.map(
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
            const 价差走平大 = 指标.map(
                () => Math.min(动态时间_y秒大.length, 价格.length, x秒内极值点价格.length),
                i => {
                    //1秒2根
                    const y根 = 动态时间_y秒大[i] * 2
                    if (isNaN(y根)) return false
                    const 极值 = x秒内极值点价格[Math.max(0, i - y根 + 1)]
                    for (let k = i; k > Math.max(-1, i - y根); k--) {
                        if (type === '上涨' && 价格[k] > (极值 + (价差[i] > 50 ? 1 : 0))) {//继续创新高
                            return false
                        }

                        if (type === '下跌' && 价格[k] < (极值 - (价差[i] > 50 ? 1 : 0))) {//继续创新低
                            return false
                        }
                    }
                    return true
                }
            )



            const 震荡指数 = 指标.map(
                () => Math.min(价差.length, 价格_波动率15.length),
                i => 价差[i] > 2 ? toRange({ min: 0.01, max: 10, value: 价格_波动率15[i] / 价差[i] }) : NaN
            )


            const 震荡指数_最高30 = 指标.map(
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
                动态时间_小y秒,
                动态时间_x秒,
                动态时间_y秒,
                x秒内极值点价格,
                价差走平hopex,
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
        const 价格差_除以时间 = 指标.map2({ 起点index: NaN, 起点Type: 'none' as '上涨' | '下跌' }, (arr: number[], ext) => {
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
                arr[i] = isNaN(ext.起点index) === false && 上涨下跌价差(ext.起点Type)[i] >= 4 ? toRange({ min: 0.01, max: 10, value: 上涨下跌价差(ext.起点Type)[i] / a }) : NaN  //除以根数 
                //<---------------------------------------------------
            }
        })

        const 价格速度_macd = 指标.macd(价格差_除以时间, RealDataBase.单位时间)

        const 震荡指数 = 指标.map(() => Math.min(上涨.价差.length, 下跌.价差.length, 上涨_下跌_横盘.length, 价格_波动率30.length), i => {
            const 上涨下跌价差 = (上涨_下跌_横盘[i] === '上涨' ? 上涨.价差 : 下跌.价差)[i]
            return 上涨下跌价差 > 2 ? toRange({ min: 0.01, max: 10, value: 价格_波动率30[i] / 上涨下跌价差 }) : NaN
        })

        const 震荡指数_macd = 指标.macd(震荡指数, RealDataBase.单位时间)

        const 动态价格秒数 = 指标.map(
            () => Math.min(价格.length, 上涨.价差.length, 下跌.价差.length),
            i => toRange({ min: 15, max: 25, value: ((上涨_下跌_横盘[i] === '上涨' ? 上涨.价差 : 下跌.价差)[i] / 5) }) ,
        )
        const 动态价格_均线 = 指标.SMA(价格, 7, RealDataBase.单位时间)
        const 动态价格_均线方差 = 指标.map(() => Math.min(动态价格_均线.length, 价格.length), i => {
            let sum = 0
            for (let n = (价格.length - 动态价格秒数[i] * 2); n < 价格.length; n++) {
                sum = sum + Math.pow((价格[n] - 动态价格_均线[i]), 2)
            }
            let 方差 = Math.sqrt(sum / (7 * 2))
            return 方差
        })
        const 动态价格_均线方差macd = 指标.macd(动态价格_均线方差, RealDataBase.单位时间)

        const 绝对价差 = 指标.map(() => Math.min(上涨.价差.length, 下跌.价差.length, 上涨_下跌_横盘.length), i => 上涨_下跌_横盘[i] === '上涨' ? 上涨.价差[i] : 下跌.价差[i])
        //_______________________________________________________________________________________________________________________________//


        //????????????????
        const 累计成交量阈值 = 指标.map(() => Math.min(上涨.价差.length, 下跌.价差.length, 上涨_下跌_横盘.length), i => 上涨_下跌_横盘[i] === '上涨' ? 150 * 10000 * 上涨.价差[i] + 300 * 10000 : 150 * 10000 * 下跌.价差[i] + 300 * 10000)
        const 实时成交量 = 指标.map(() => Math.min(上涨.累计成交量.length, 下跌.累计成交量.length, 上涨_下跌_横盘.length), i => 上涨_下跌_横盘[i] === '上涨' ? 上涨.累计成交量[i] : 下跌.累计成交量[i])
        const 实时与标准成交量之差 = 指标.map(() => Math.min(累计成交量阈值.length, 实时成交量.length), i => (实时成交量[i] - 累计成交量阈值[i]))
        const 实时与标准成交量之差macd = 指标.macd(实时与标准成交量之差, RealDataBase.单位时间)
 


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
            // 价格乘以ln主动买: 指标.map(() => Math.min(收盘价.length, xxx.吃单情况.length), i => 收盘价[i] * Math.log(xxx.吃单情况[i].卖.被吃量)),
            // 价格乘以ln主动卖: 指标.map(() => Math.min(收盘价.length, xxx.吃单情况.length), i => 收盘价[i] * Math.log(xxx.吃单情况[i].买.被吃量)),
            价格乘以ln主动买: 指标.map(() => Math.min(收盘价.length, 买.成交量_累加60.length), i => 收盘价[i] * Math.log(买.成交量_累加60[i])),
            价格乘以ln主动卖: 指标.map(() => Math.min(收盘价.length, 卖.成交量_累加60.length), i => 收盘价[i] * Math.log(卖.成交量_累加60[i])),


            价格_均线13,
            价格_均线34,
            价格_均线20,
            价格_均线89,
            价格_均线144,
            价格_均线12,
            价格_均线60,
            tick力量指数60,
            tick力量指数12,
            价格macd,
            // 着笔,
            // 着笔涨跌,
            bitmex_价格_macd,

            _60s_,
            _20s_布林,
            _12s_macd,
            _13s_布林,
            _60s_macd,
            _300s_macd, 

            时间str,
            波动_测试,



            价格均线价差,
            价格_均线120,
            价格_波动率60,
            动态价格_均线方差macd,
            动态价格_均线方差,
            动态价格_均线,
            实时与标准成交量之差macd,
            实时与标准成交量之差,
            价格速度_macd,
            累计成交量阈值,
            成交性质,
            KLine,
            净成交量abs_累加5,
            绝对价差,
            买,
            卖,
            震荡指数_macd,
            震荡指数,
            收盘价,
            盘口: orderBook,
            时间,
            价格_波动率300,
            折返率,

            价格差_除以时间,
            上涨_下跌_横盘,
            上涨_下跌_横盘追涨追跌专用,
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

            价格_最高60,
            价格_最低60,
            价格_最高60_价差,
            被动_买均价_300,
            被动_卖均价_300,
        }
    }


    private item = (symbol: BaseType.BitmexSymbol, hopexSymbol: BaseType.HopexSymbol) => {

        const bitmex = this.item2(this.data.bitmex[symbol], true)
        const hopex = this.item2(this.data.hopex[hopexSymbol], true)


        const hopex_bitmex_差价 = 指标.map(() => Math.min(hopex.价格.length, bitmex.价格.length), i => hopex.价格[i] - bitmex.价格[i])
        const hopex_bitmex_差价均线 = 指标.SMA(hopex_bitmex_差价, 300, RealDataBase.单位时间)
        const hopex_bitmex_相对差价 = 指标.map(() => Math.min(hopex.价格.length, bitmex.价格.length), i => hopex_bitmex_差价[i] - hopex_bitmex_差价均线[i])



        const bitmex_hopex_上涨差价 = 指标.map(() => Math.min(bitmex.价格_最高60.length, hopex.价格.length), i => bitmex.价格_最高60[i] - hopex.价格[i])
        const bitmex_hopex_下跌差价 = 指标.map(() => Math.min(bitmex.价格_最低60.length, hopex.价格.length), i => bitmex.价格_最低60[i] - hopex.价格[i])

        const bitmex_hopex_上涨差价均线 = 指标.SMA(bitmex_hopex_上涨差价, 360, RealDataBase.单位时间)
        const bitmex_hopex_下跌差价均线 = 指标.SMA(bitmex_hopex_下跌差价, 360, RealDataBase.单位时间)

        const bitmex_hopex_上涨相对价差 = 指标.map(() => Math.min(bitmex_hopex_上涨差价.length, bitmex_hopex_上涨差价均线.length), i => bitmex_hopex_上涨差价[i] - bitmex_hopex_上涨差价均线[i])
        const bitmex_hopex_下跌相对价差 = 指标.map(() => Math.min(bitmex_hopex_下跌差价.length, bitmex_hopex_下跌差价均线.length), i => bitmex_hopex_下跌差价[i] - bitmex_hopex_下跌差价均线[i])

        const bitmex_hopex_上涨相对差价均线 = 指标.SMA(bitmex_hopex_上涨相对价差, 10, RealDataBase.单位时间)
        const bitmex_hopex_下跌相对价差均线 = 指标.SMA(bitmex_hopex_下跌相对价差, 10, RealDataBase.单位时间)

        const bitmex_hopex_上涨相对差价macd = 指标.macd(bitmex_hopex_上涨相对价差, RealDataBase.单位时间)
        const bitmex_hopex_下跌相对差价macd = 指标.macd(bitmex_hopex_下跌相对价差, RealDataBase.单位时间)
        const hopex_价格_macd = 指标.macd(hopex.价格, RealDataBase.单位时间)
 


        return {
            hopex_bitmex_差价,
            hopex_bitmex_相对差价,  

            hopex_价格_macd,
            bitmex_hopex_上涨差价,
            bitmex_hopex_下跌差价,

            bitmex_hopex_上涨差价均线,
            bitmex_hopex_下跌差价均线,

            bitmex_hopex_上涨相对价差,
            bitmex_hopex_下跌相对价差,

            bitmex_hopex_上涨相对差价均线,
            bitmex_hopex_下跌相对价差均线,
            binance_bitmex_差价均线: hopex_bitmex_差价均线,

            bitmex_hopex_上涨相对差价macd,
            bitmex_hopex_下跌相对差价macd, 

            期货30秒内成交量: () => this.get期货多少秒内成交量__万为单位(symbol, 30),

            bitmex,
            hopex,
        }
    }

    dataExt = {
        XBTUSD: this.item('XBTUSD', 'BTCUSDT'),
        ETHUSD: this.item('ETHUSD', 'ETHUSDT'),
        ctp: mapObjIndexed((v, k) => this.item2(this.data.ctp[k], true), ______CTP__config),
        bitmex: mapObjIndexed((v, k) => this.item2(this.data.bitmex[k], false), BaseType.BitmexSymbolDic),
        hopex: mapObjIndexed((v, k) => this.item2(this.data.hopex[k], false), BaseType.HopexSymbolDic),
        ix: mapObjIndexed((v, k) => this.item2(this.data.ix[k], false), BaseType.IXSymbolDic),
    }

    重新初始化 = () => {
        this.dataExt = {
            XBTUSD: this.item('XBTUSD', 'BTCUSDT'),
            ETHUSD: this.item('ETHUSD', 'ETHUSDT'),
            ctp: mapObjIndexed((v, k) => this.item2(this.data.ctp[k], true), ______CTP__config),
            bitmex: mapObjIndexed((v, k) => this.item2(this.data.bitmex[k], false), BaseType.BitmexSymbolDic),
            hopex: mapObjIndexed((v, k) => this.item2(this.data.hopex[k], false), BaseType.HopexSymbolDic),
            ix: mapObjIndexed((v, k) => this.item2(this.data.ix[k], false), BaseType.IXSymbolDic),
        }
    } 

}