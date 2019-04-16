import { PositionAndOrder } from '../lib/____API____/PositionAndOrder/PositionAndOrder'
import { BaseType } from '../lib/BaseType'
import { toBuySellPriceFunc } from '../lib/F/toBuySellPriceFunc'
import { lastNumber } from '../lib/F/lastNumber'
import { toRange } from '../lib/F/toRange'
import { to价格对齐 } from '../lib/F/to价格对齐'
import { PositionAndOrderTask } from '../lib/____API____/PositionAndOrder/PositionAndOrder'
import { XBTUSD摸顶抄底追涨追跌__参数 } from './XBTUSD摸顶抄底追涨追跌__参数'
import { RealDataBase } from '../RealDataServer/RealDataBase'

const newState = () => ({
    连续止损次数: 0,
    最后一次止损状态: '',

    最后一次信号: 'none' as 'none' | '追涨' | '追跌' | '摸顶' | '抄底',
    最后一次信号时间: 0,
    最后一次上涨_下跌: '',
    到什么时间不开仓: 0,


    开仓状态: {
        最大仓位abs: NaN,
        最后一次开仓时间: NaN,
        最后一次开仓折返率: NaN,
        摸顶抄底超时秒: NaN,
        第2次超时: false,
        已经平了一半了: false,
    }
})

type XXX = {
    market: 'bitmex' | 'hopex'
    d: RealDataBase['dataExt']['XBTUSD']['bitmex']
    state: XBTUSD摸顶抄底追涨追跌['bitmex_state']
    item: PositionAndOrder['jsonSync']['rawData']['market']['bitmex']['XBTUSD']
}

const get浮盈点数 = (x: XXX) => {
    const 最新价 = lastNumber(x.d.收盘价)
    if (最新价 === undefined) return NaN

    const { 仓位数量, 开仓均价 } = x.item

    if (仓位数量 > 0) {
        return 最新价 - 开仓均价
    } else if (仓位数量 < 0) {
        return 开仓均价 - 最新价
    } else {
        return NaN
    }
}

export class XBTUSD摸顶抄底追涨追跌 implements PositionAndOrderTask {

    开关 = false

    参数type = {
        自动开仓摸顶: false,
        自动开仓抄底: false,
        自动开仓追涨: false,
        自动开仓追跌: false,
        自动止盈波段: false,
        自动止损: false,
        自动推止损: false,
    }

    参数 = {
        自动开仓摸顶: false,
        自动开仓抄底: false,
        自动开仓追涨: false,
        自动开仓追跌: false,
        自动止盈波段: false,
        自动止损: false,
        自动推止损: false,
    }


    private bitmex_state = newState()
    private hopex_state = newState()

    onFilled(p: { symbol: BaseType.BitmexSymbol, type: '限价' | '限价只减仓' | '止损' | '强平' }) {
        if (p.symbol === 'XBTUSD') {
            if (p.type === '限价只减仓') {
                this.bitmex_state.连续止损次数 = 0 //不考虑 亏损挂单
            }
            else if (p.type === '止损') {
                if (this.bitmex_state.最后一次止损状态 === '亏损止损') {
                    this.bitmex_state.连续止损次数 += 1
                }
            }
            else if (p.type === '强平') {
                this.bitmex_state.连续止损次数 += 1
            }
        }
    }


    onHopexTick(self: PositionAndOrder) {

        const x: XXX = {
            market: 'hopex',
            d: self.realData.dataExt.XBTUSD.hopex,
            state: this.hopex_state,
            item: self.jsonSync.rawData.market.hopex.BTCUSDT,
        }

        const bbb = this.止损_step(self, x)
        if (bbb) return bbb

        const { 仓位数量 } = self.jsonSync.rawData.market.hopex.BTCUSDT
        if (仓位数量 === 0) {
            this.hopex_state.开仓状态 = {
                最大仓位abs: NaN,
                最后一次开仓时间: NaN,
                最后一次开仓折返率: NaN,
                摸顶抄底超时秒: NaN,
                第2次超时: false,
                已经平了一半了: false,
            }
            return this.开仓_step(self, x)
        } else {
            return this.平仓_step(self, x)
        }
    }

    onTick(self: PositionAndOrder) {

        // const x: XXX = {
        //     market: 'bitmex',
        //     d: self.realData.dataExt.XBTUSD.bitmex,
        //     state: this.bitmex_state,
        //     item: self.jsonSync.rawData.market.bitmex.XBTUSD,
        // }

        // const aaa = this.bitmex_委托检测(self, x)
        // if (aaa) return aaa

        // const bbb = this.止损_step(self, x)
        // if (bbb) return bbb

        // const { 仓位数量 } = self.jsonSync.rawData.market.bitmex.XBTUSD
        // if (仓位数量 === 0) {
        //     this.bitmex_state.开仓状态 = {
        //         最大仓位abs: NaN,
        //         最后一次开仓时间: NaN,
        //         最后一次开仓折返率: NaN,
        //         摸顶抄底超时秒: NaN,
        //         第2次超时: false,
        //         已经平了一半了: false,
        //     }
        //     return this.开仓_step(self, x)
        // } else {
        //     return this.平仓_step(self, x)
        // }

        return true
    }

    // private bitmex_委托检测(self: PositionAndOrder, x: XXX) {
    //     const { item } = x
    //     const { 仓位数量 } = item

    //     //委托检测
    //     const 活动委托 = item.委托列表.filter(v => v.type !== '止损')

    //     //没有委托
    //     if (活动委托.length === 0) {
    //         return false //<----------------------------------------------
    //     }
    //     else if (活动委托.length === 1) {
    //         if (
    //             //没有仓位随便
    //             仓位数量 === 0 ||

    //             //有仓位 有委托 只能是 
    //             //部分成交的委托 
    //             //依赖ws先返回 委托更新 再返回仓位更新      //<---------------------------------------------
    //             (活动委托[0].type === '限价' && 活动委托[0].cumQty !== 0) ||

    //             //或者 限价只减仓委托
    //             活动委托[0].type === '限价只减仓'
    //         ) {
    //             return false //<----------------------------------------------
    //         } else {
    //             self.log('bitmex 委托检测step 取消委托 ' + 活动委托[0].type)
    //             return self.cancel({ orderID: 活动委托.map(v => v.id) })
    //         }
    //     }
    //     else {
    //         //多个委托  全部给取消  
    //         self.log('bitmex 委托检测step 委托检测step 取消多个委托 ' + 活动委托.map(v => v.type).join(','))
    //         return self.cancel({ orderID: 活动委托.map(v => v.id) })
    //     }
    // }

    private 止损_step(self: PositionAndOrder, x: XXX) {

        const { market, state, d, item } = x

        const { 仓位数量, 开仓均价 } = item

        if (this.参数.自动止损 === false) return false

        const 止损委托 = item.委托列表.filter(v => v.type === '止损')

        const 波动率 = lastNumber(d.价格_波动率30)

        const stop = (market === 'bitmex' ? self.stop : self.hopex_stop).bind(self)

        const cancel = (arr: string[]) =>
            market === 'bitmex' ?
                self.cancel({ orderID: arr }) :
                self.hopex_cancel({ symbol: 'BTCUSDT', orderID: arr[0] })



        //没有止损 
        if (止损委托.length === 0) {

            //有仓位 初始化止损
            if (仓位数量 !== 0) {
                const 止损点 = XBTUSD摸顶抄底追涨追跌__参数.初始止损({ 波动率 })

                if (isNaN(止损点)) return false //波动率还没出来 不止损

                const side = 仓位数量 > 0 ? 'Sell' : 'Buy'

                state.最后一次止损状态 = '亏损止损'

                return stop({
                    symbol: 'BTCUSDT',
                    side,
                    price: to价格对齐({
                        grid: 0.5,
                        value: 仓位数量 > 0 ? 开仓均价 - 止损点 : 开仓均价 + 止损点,
                        side,
                    }),
                })
            }
            else {
                return false
            }
        }
        //有止损
        else if (止损委托.length === 1) {
            //没有仓位 或者 止损方向错了
            if (仓位数量 === 0 || (仓位数量 > 0 && 止损委托[0].side !== 'Sell') || (仓位数量 < 0 && 止损委托[0].side !== 'Buy')) {
                return cancel(止损委托.map(v => v.id))
            }
            else {
                if (this.参数.自动推止损 === false) return false //自动推止损 任务没打开

                //修改止损  只能改小  不能改大
                const { price, side } = 止损委托[0]
                const 浮盈点数 = get浮盈点数(x)

                const 推 = XBTUSD摸顶抄底追涨追跌__参数.推止损({
                    波动率: lastNumber(d.价格_波动率30),
                    盈利点: 浮盈点数,
                    type: state.最后一次信号
                })

                if (isNaN(推)) {
                    return false
                }

                const 新的Price = to价格对齐({
                    grid: 0.5,
                    value: 开仓均价 + (side === 'Buy' ? - 推 : 推),
                    side,
                })

                if (
                    (side === 'Buy' && 新的Price < price) ||
                    (side === 'Sell' && 新的Price > price)
                ) {
                    state.最后一次止损状态 = 推 === 0 ? '成本价止损' : '盈利止损'
                    return stop({
                        symbol: 'BTCUSDT',
                        side,
                        price: 新的Price,
                    })
                }
                return false
            }
        }
        else if (止损委托.length === 2 && 止损委托[0].side === 止损委托[1].side) {
            if (止损委托[0].side === 'Sell') {
                return cancel([止损委托[0].price < 止损委托[1].price ? 止损委托[0].id : 止损委托[1].id])
            } else {
                return cancel([止损委托[0].price > 止损委托[1].price ? 止损委托[0].id : 止损委托[1].id])
            }
        }
        else {
            return cancel(止损委托.map(v => v.id))
        }
    }

    private 开仓_step(self: PositionAndOrder, x: XXX) {

        const { market, item, d, state } = x

        const 活动委托 = item.委托列表.filter(v => v.type !== '止损')

        const 仓位数量 = market === 'bitmex' ? self.get本地维护仓位数量('XBTUSD') : item.仓位数量

        if (
            this.参数.自动开仓追涨 === false &&
            this.参数.自动开仓追跌 === false &&
            this.参数.自动开仓抄底 === false &&
            this.参数.自动开仓摸顶 === false
        ) return false

        const 信号灯Type = self.realData.get信号灯Type(market)
        const 开仓side = { '追涨': 'Buy', '追跌': 'Sell', '抄底': 'Buy', '摸顶': 'Sell', 'none': '_____' }[信号灯Type] as BaseType.Side

        //上涨 下跌 切换 止损次数 清零
        const xx = d.上涨_下跌_横盘
        if (xx.length > 0 && state.最后一次上涨_下跌 !== xx[xx.length - 1]) {
            state.最后一次上涨_下跌 = xx[xx.length - 1]
            state.连续止损次数 = 0
        }

        if (state.连续止损次数 >= 4) {
            state.到什么时间不开仓 = lastNumber(d.时间) + 1000 * 60 * 10
            state.连续止损次数 = 0
        }

        //开仓
        if (仓位数量 === 0 && 活动委托.length === 0 && 信号灯Type !== 'none') {

            if (信号灯Type === '追涨' && this.参数.自动开仓追涨 === false) return false
            if (信号灯Type === '追跌' && this.参数.自动开仓追跌 === false) return false
            if (信号灯Type === '抄底' && this.参数.自动开仓抄底 === false) return false
            if (信号灯Type === '摸顶' && this.参数.自动开仓摸顶 === false) return false
            if (
                (lastNumber(d.时间) - state.最后一次信号时间 < 20 * 1000) && //没有超时
                (                                             //抵消
                    (state.最后一次信号 === '追涨' && 信号灯Type === '摸顶') ||
                    (state.最后一次信号 === '追跌' && 信号灯Type === '抄底') ||
                    (state.最后一次信号 === '抄底' && 信号灯Type === '追跌') ||
                    (state.最后一次信号 === '摸顶' && 信号灯Type === '追涨')
                )
            ) {
                return false
            }

            state.最后一次信号 = 信号灯Type
            state.最后一次信号时间 = lastNumber(d.时间)
            self.log(market + ' state.最后一次信号 = ' + state.最后一次信号)


            const 市价 = 信号灯Type === '追涨' || 信号灯Type === '追跌' || lastNumber(d.绝对价差) > 15


            if (lastNumber(d.时间) > state.到什么时间不开仓) {
                self.log(`${market} 自动开仓 ${信号灯Type}  市价=${市价}`)
                return market === 'bitmex' ?
                    市价 ?
                        self.taker({
                            symbol: 'XBTUSD',
                            side: 开仓side,
                            size: XBTUSD摸顶抄底追涨追跌__参数.交易数量 * (state.连续止损次数 + 1),
                            text: 信号灯Type,
                        }) :
                        self.maker({
                            symbol: 'XBTUSD',
                            side: 开仓side,
                            size: XBTUSD摸顶抄底追涨追跌__参数.交易数量 * (state.连续止损次数 + 1),
                            price: toBuySellPriceFunc(开仓side, () => self.realData.getOrderPrice({
                                symbol: 'XBTUSD',
                                side: 开仓side,
                                type: 'maker',
                                位置: 0,
                            })),
                            reduceOnly: false,
                            text: 信号灯Type,
                        })
                    :
                    self.hopex_taker({
                        symbol: 'BTCUSDT',
                        side: 开仓side,
                        size: XBTUSD摸顶抄底追涨追跌__参数.交易数量 * (state.连续止损次数 + 1),
                    })
            } else {
                return true
            }
        }

        //取消开仓
        if (market === 'bitmex' && 活动委托.length === 1) {
            const { type, timestamp, id, side } = 活动委托[0]
            if (type === '限价') {
                const _15秒取消 = (lastNumber(d.时间) > (timestamp + 15 * 1000))
                const 出现反向信号时候取消 = (信号灯Type !== 'none' && 开仓side !== side)
                if (_15秒取消 || 出现反向信号时候取消) {
                    self.log('bitmex 取消开仓 ' + '自动开仓step 取消开仓 ' + _15秒取消 ? '_15秒取消' : '出现反向信号时候取消')
                    return self.cancel({ orderID: [id] })
                }
            }
        }
        return false
    }


    private 平仓_step(self: PositionAndOrder, x: XXX) {

        const { market, item, d, state } = x
        const { 仓位数量 } = item
        const 活动委托 = item.委托列表.filter(v => v.type !== '止损')


        //开关没打开
        if (this.参数.自动止盈波段 === false) return false

        //仓位变大了 更新开仓状态
        if (isNaN(state.开仓状态.最大仓位abs) || state.开仓状态.最大仓位abs < Math.abs(仓位数量)) {
            state.开仓状态 = {
                最大仓位abs: Math.abs(仓位数量),
                最后一次开仓时间: lastNumber(d.时间),
                最后一次开仓折返率: lastNumber(d.折返率),
                摸顶抄底超时秒: toRange({ min: 15, max: 30, value: lastNumber(d.价格_波动率30) / 7 + 20 }),
                第2次超时: false,
                已经平了一半了: false,
            }
        }

        const 持仓时间ms = lastNumber(d.时间) - state.开仓状态.最后一次开仓时间
        const 平仓side = 仓位数量 > 0 ? 'Sell' : 'Buy'
        const get_bitmex_位置1价格 = () => self.realData.getOrderPrice({
            symbol: 'XBTUSD',
            side: 平仓side,
            type: 'maker',
            位置: 0,
        })
        const 震荡指数衰竭 = lastNumber(d.震荡指数_macd.DIF) < lastNumber(d.震荡指数_macd.DEM)

        //有多个委托了
        if (活动委托.length > 1) return false

        //持仓时间没有10秒        
        if (持仓时间ms < 10 * 1000) return false

        //______________________________________亏损挂单平仓______________________________________//
        //如果超时了 
        if (持仓时间ms >= state.开仓状态.摸顶抄底超时秒 * 1000 && state.开仓状态.第2次超时 === false) {
            state.开仓状态.第2次超时 = true
            if (!震荡指数衰竭) { //dif>dem 
                state.开仓状态.摸顶抄底超时秒 = 15
            }
        }
        let 亏损挂单平仓Text = ''
        if (state.最后一次信号 === '摸顶' || state.最后一次信号 === '抄底') {
            const 没有折返 = get浮盈点数(x) < state.开仓状态.最后一次开仓折返率
            if (
                (没有折返 && 震荡指数衰竭 === true && 持仓时间ms >= state.开仓状态.摸顶抄底超时秒 * 1000) ||      // 折返函数&&震荡衰竭==true的超时时间是30s
                (没有折返 && 震荡指数衰竭 === false && 持仓时间ms >= 120 * 1000)  // 折返函数&&震荡衰竭==false的超时时间是2分钟
            ) {
                亏损挂单平仓Text = '下单' + 持仓时间ms + ' ms秒后，折返没有超过下单点的折返函数，并且震荡指数衰竭，挂单全平  震荡指数衰竭=' + 震荡指数衰竭
            }
        }
        else if (state.最后一次信号 === '追涨' || state.最后一次信号 === '追跌') {
            const 净成交量均线60 = lastNumber(d.买.净成交量_累加60)

            if ((平仓side === 'Sell' && 净成交量均线60 < 0) || (平仓side === 'Buy' && 净成交量均线60 > 0)) {
                亏损挂单平仓Text = '如果净成交量反向，那么立刻挂单平仓'
            }
            else if (持仓时间ms > 5 * 60 * 1000) {
                亏损挂单平仓Text = '如果净成交量没有反向，那么最多等待5分钟，然后挂单平仓'
            } else {
                //如果遇到极值点，平仓只需要两根信号
            }

        }
        if (亏损挂单平仓Text !== '') {

            if (活动委托.length === 1) {
                if (活动委托[0].type === '限价只减仓' && 活动委托[0].side === 平仓side) {
                    if (活动委托[0].price !== get_bitmex_位置1价格()) {
                        self.log('bitmex update maker ' + state.最后一次信号 + '平仓' + '  ' + 亏损挂单平仓Text + '  重新挂' + 平仓side + '1')
                        return self.updateMaker({
                            orderID: 活动委托[0].id,
                            price: toBuySellPriceFunc(平仓side, get_bitmex_位置1价格),
                        })
                    } else {
                        return false
                    }
                }
            } else {
                self.log(market + ' ' + state.最后一次信号 + '平仓' + '  ' + 亏损挂单平仓Text)
                return market === 'bitmex' ?
                    self.maker({
                        symbol: 'XBTUSD',
                        side: 平仓side,
                        size: state.开仓状态.最大仓位abs,
                        price: toBuySellPriceFunc(平仓side, get_bitmex_位置1价格),
                        reduceOnly: true,
                        text: state.最后一次信号 + '平仓' + '  ' + 亏损挂单平仓Text,
                    }) :
                    self.hopex_taker({
                        symbol: 'BTCUSDT',
                        side: 平仓side,
                        size: state.开仓状态.最大仓位abs,
                    })
            }
        }

        //______________________________________  摸顶_下跌平仓    抄底_上涨平仓    一半  ______________________________________ 
        if (state.开仓状态.已经平了一半了 === false) {
            if (state.最后一次信号 === '摸顶' && self.realData.is摸顶_下跌平仓(market) && 活动委托.length === 0) {
                state.开仓状态.已经平了一半了 = true
                self.log(market + '  ' + state.最后一次信号 + '平仓' + '  ' + '自动止盈波段step 上涨做空下跌平仓一半')
                return market === 'bitmex' ?
                    self.maker({
                        symbol: 'XBTUSD',
                        side: 平仓side,
                        size: Math.round(state.开仓状态.最大仓位abs / 2),//一半
                        price: toBuySellPriceFunc(平仓side, get_bitmex_位置1价格),
                        reduceOnly: true,
                        text: state.最后一次信号 + '平仓' + '  ' + '自动止盈波段step 上涨做空下跌平仓一半',
                    }) :
                    self.hopex_taker({
                        symbol: 'BTCUSDT',
                        side: 平仓side,
                        size: Math.round(state.开仓状态.最大仓位abs / 2),//一半
                    })
            }
            if (state.最后一次信号 === '抄底' && self.realData.is抄底_上涨平仓(market) && 活动委托.length === 0) {
                state.开仓状态.已经平了一半了 = true
                self.log(market + '  ' + state.最后一次信号 + '平仓' + '  ' + '自动止盈波段step 下跌抄底上涨平仓一半')
                return market === 'bitmex' ?
                    self.maker({
                        symbol: 'XBTUSD',
                        side: 平仓side,
                        size: Math.round(state.开仓状态.最大仓位abs / 2),//一半
                        price: toBuySellPriceFunc(平仓side, get_bitmex_位置1价格),
                        reduceOnly: true,
                        text: state.最后一次信号 + '平仓' + '  ' + '自动止盈波段step 下跌抄底上涨平仓一半',
                    }) :
                    self.hopex_taker({
                        symbol: 'BTCUSDT',
                        side: 平仓side,
                        size: Math.round(state.开仓状态.最大仓位abs / 2),//一半
                    })
            }
        }

        //______________________________________ 触发了反向开仓信号 全平______________________________________ 
        const { 信号side } = self.realData.摸顶抄底_反向信号_平仓(market)
        if (信号side === 平仓side && 活动委托.length === 0) {

            const 市价 = lastNumber(d.绝对价差) > 15
            self.log(`${market} 信号side=${信号side} ` + state.最后一次信号 + '平仓' + ' 触发了反向开仓信号  ' + '自动止盈波段step 全部止盈')

            return market === 'bitmex' ?
                市价 ?
                    self.taker({
                        symbol: 'XBTUSD',
                        side: 平仓side,
                        size: Math.abs(仓位数量),
                        text: state.最后一次信号 + '平仓' + ' 触发了反向开仓信号  ' + '自动止盈波段step 全部止盈',
                    }) :
                    self.maker({
                        symbol: 'XBTUSD',
                        side: 平仓side,
                        size: Math.abs(仓位数量),
                        price: toBuySellPriceFunc(平仓side, get_bitmex_位置1价格),
                        reduceOnly: true,
                        text: state.最后一次信号 + '平仓' + ' 触发了反向开仓信号  ' + '自动止盈波段step 全部止盈',
                    }) :
                self.hopex_taker({
                    symbol: 'BTCUSDT',
                    side: 平仓side,
                    size: Math.abs(仓位数量),
                })

        }
        return false

    }
}