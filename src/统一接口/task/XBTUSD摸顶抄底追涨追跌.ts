import { PositionAndOrder } from '../PositionAndOrder/PositionAndOrder'
import { BaseType } from '../../lib/BaseType'
import { toBuySellPriceFunc } from '../../lib/C/toBuySellPriceFunc'
import { lastNumber } from '../../lib/F/lastNumber'
import { to范围 } from '../../lib/F/to范围'
import { toGridPoint } from '../../lib/F/toGridPoint'
import { PositionAndOrderTask } from '../PositionAndOrder/PositionAndOrder'


const symbol = 'XBTUSD'
const 交易数量 = 2


export class XBTUSD摸顶抄底追涨追跌 implements PositionAndOrderTask {


    推止损(波动率: number, 盈利点: number, type: string) {
        if (type === '追涨' || type === '追跌') {
            if (盈利点 >= 10) {
                return 5
            }
            else if (盈利点 >= 3) {
                return 0
            } else {
                return NaN
            }

        } else {
            if (盈利点 >= to范围({ min: 5, max: 30, value: 波动率 / 5 + 15 })) {
                return 5
            }
            else if (盈利点 >= to范围({ min: 5, max: 15, value: 波动率 / 8 + 6 })) {
                return 0
            } else {
                return NaN
            }
        }

    }

    async 止损step(self: PositionAndOrder) {
        const { 仓位数量, 开仓均价 } = self.jsonSync.rawData.symbol[symbol]
        const 止损委托 = self.jsonSync.rawData.symbol[symbol].活动委托.filter(v => v.type === '止损')

        const 波动率 = self.realData.get波动率(symbol)

        //没有止损 
        if (止损委托.length === 0) {
            //有仓位 初始化止损
            if (仓位数量 !== 0) {

                const 止损点 = to范围({
                    min: 4,
                    max: 18,
                    value: 波动率 / 7 + 4,
                })

                if (isNaN(止损点)) return false //波动率还没出来 不止损

                const side = 仓位数量 > 0 ? 'Sell' : 'Buy'

                this.最后一次止损状态 = '亏损止损'
                return await self.stop({
                    symbol,
                    side,
                    price: toGridPoint(symbol, 仓位数量 > 0 ? 开仓均价 - 止损点 : 开仓均价 + 止损点, side),
                    text: '亏损止损',
                }, '')
            }
            else {
                return false
            }
        }
        //有止损
        else if (止损委托.length === 1) {
            //没有仓位 或者 止损方向错了
            if (仓位数量 === 0 || (仓位数量 > 0 && 止损委托[0].side !== 'Sell') || (仓位数量 < 0 && 止损委托[0].side !== 'Buy')) {
                //ws返回有时间  直接给委托列表加一条记录??           
                return await self.cancel({ orderID: 止损委托.map(v => v.id), text: '止损step 取消止损' })
            }
            else {
                if (self.jsonSync.rawData.symbol[symbol].任务开关.自动推止损 === false) return false //自动推止损 任务没打开

                //修改止损  只能改小  不能改大
                const { price, side, id } = 止损委托[0]
                const 浮盈点数 = self.get浮盈点数(symbol)

                const 推 = this.推止损(self.realData.get波动率(symbol), 浮盈点数, this.最后一次信号)
                if (isNaN(推)) {
                    return false
                }

                const 新的Price = toGridPoint(symbol, 开仓均价 + (side === 'Buy' ? - 推 : 推), side)

                if (
                    (side === 'Buy' && 新的Price < price) ||
                    (side === 'Sell' && 新的Price > price)
                ) {
                    this.最后一次止损状态 = 推 === 0 ? '成本价止损' : '盈利止损'
                    return await self.updateStop({
                        orderID: id,
                        price: 新的Price,
                    }, this.最后一次止损状态)
                }
                return false
            }
        }
        else {
            //多个止损 全部清空
            //ws返回有时间  直接给委托列表加一条记录??       
            return await self.cancel({ orderID: 止损委托.map(v => v.id), text: '止损step 取消多个止损' })
        }
    }


    private 连续止损2 = 0
    private 最后一次止损状态 = ''
    onFilled(p: { symbol: BaseType.BitmexSymbol, type: '限价' | '限价只减仓' | '止损' | '强平' }) {
        if (p.symbol === 'XBTUSD') {
            if (p.type === '限价只减仓') {
                this.连续止损2 = 0 //不考虑 亏损挂单
            }
            else if (p.type === '止损') {
                if (this.最后一次止损状态 === '亏损止损') {
                    this.连续止损2 += 1
                }
            }
            else if (p.type === '强平') {
                this.连续止损2 += 1
            }
        }
    }


    // 摸顶 = false
    // 抄底 = false
    // 追涨 = false
    // 追跌 = false
    // 止盈 = false
    // 先写到 jsonSync 里面

    async onTick(self: PositionAndOrder) {
        const { 仓位数量 } = self.jsonSync.rawData.symbol[symbol]

        //委托检测
        const 活动委托 = self.jsonSync.rawData.symbol[symbol].活动委托.filter(v => v.type !== '止损')

        //没有委托
        if (活动委托.length === 0) {
            //return false //<----------------------------------------------
        }
        else if (活动委托.length === 1) {
            if (
                //没有仓位随便
                仓位数量 === 0 ||

                //有仓位 有委托 只能是 
                //部分成交的委托 
                //依赖ws先返回 委托更新 再返回仓位更新      //<---------------------------------------------
                (活动委托[0].type === '限价' && 活动委托[0].cumQty !== 0) ||

                //或者 限价只减仓委托
                活动委托[0].type === '限价只减仓'
            ) {
                //return false //<----------------------------------------------
            } else {
                return await self.cancel({ orderID: 活动委托.map(v => v.id), text: '委托检测step 取消委托' }, 活动委托[0].type)
            }
        }
        else {
            //多个委托  全部给取消  
            return await self.cancel({ orderID: 活动委托.map(v => v.id), text: '委托检测step 取消多个委托' }, 活动委托.map(v => v.type).join(','))
        }



        //止损
        const x = await this.止损step(self)
        if (x) {
            return true
        }



        if (仓位数量 === 0) {
            this.最大仓位abs = NaN
            this.最后一次开仓时间 = NaN
            this.最后一次开仓折返率 = NaN
            this.摸顶抄底超时秒 = NaN
            return this.自动开仓(self)
        } else {
            return this.自动止盈(self)
        }
    }


    private 最后一次信号 = 'none' as 'none' | '追涨' | '追跌' | '摸顶' | '抄底'
    private 最后一次信号时间 = 0
    private 最后一次上涨_下跌 = ''
    private 到什么时间不开仓 = 0

    private async 自动开仓(self: PositionAndOrder) {

        if (self.jsonSync.rawData.symbol[symbol].任务开关.自动开仓追涨 === false
            && self.jsonSync.rawData.symbol[symbol].任务开关.自动开仓追跌 === false
            && self.jsonSync.rawData.symbol[symbol].任务开关.自动开仓抄底 === false
            && self.jsonSync.rawData.symbol[symbol].任务开关.自动开仓摸顶 === false) return false

        const { 仓位数量 } = self.jsonSync.rawData.symbol[symbol]

        const 本地维护仓位数量 = self.get本地维护仓位数量(symbol)

        const 活动委托 = self.jsonSync.rawData.symbol[symbol].活动委托.filter(v => v.type !== '止损')

        const 信号灯Type = self.realData.get信号灯Type(symbol)
        const 开仓side = { '追涨': 'Buy', '追跌': 'Sell', '抄底': 'Buy', '摸顶': 'Sell', 'none': '_____' }[信号灯Type] as BaseType.Side

        //上涨 下跌 切换 止损次数 清零
        const x = self.realData.dataExt[symbol].期货.上涨_下跌
        if (x.length > 0 && this.最后一次上涨_下跌 !== x[x.length - 1]) {
            this.最后一次上涨_下跌 = x[x.length - 1]
            this.连续止损2 = 0
        }

        if (this.连续止损2 >= 4) {
            this.到什么时间不开仓 = lastNumber(self.realData.dataExt[symbol].期货.时间) + 1000 * 60 * 10
            this.连续止损2 = 0
        }

        //开仓
        if (本地维护仓位数量 === 0 && 仓位数量 === 0 && 活动委托.length === 0 && 信号灯Type !== 'none') {

            if (信号灯Type === '追涨' && self.jsonSync.rawData.symbol[symbol].任务开关.自动开仓追涨 === false) return false
            if (信号灯Type === '追跌' && self.jsonSync.rawData.symbol[symbol].任务开关.自动开仓追跌 === false) return false
            if (信号灯Type === '抄底' && self.jsonSync.rawData.symbol[symbol].任务开关.自动开仓抄底 === false) return false
            if (信号灯Type === '摸顶' && self.jsonSync.rawData.symbol[symbol].任务开关.自动开仓摸顶 === false) return false
            if (
                (lastNumber(self.realData.dataExt[symbol].期货.时间) - this.最后一次信号时间 < 20 * 1000) && //没有超时
                (                                             //抵消
                    (this.最后一次信号 === '追涨' && 信号灯Type === '摸顶') ||
                    (this.最后一次信号 === '追跌' && 信号灯Type === '抄底') ||
                    (this.最后一次信号 === '抄底' && 信号灯Type === '追跌') ||
                    (this.最后一次信号 === '摸顶' && 信号灯Type === '追涨')
                )
            ) {
                return false
            }

            this.最后一次信号 = 信号灯Type
            this.最后一次信号时间 = lastNumber(self.realData.dataExt[symbol].期货.时间)


            const 市价 = 信号灯Type === '追涨' || 信号灯Type === '追跌' || self.realData.get波动率(symbol) < 30


            if (lastNumber(self.realData.dataExt[symbol].期货.时间) > this.到什么时间不开仓) {
                return 市价 ?
                    await self.taker({
                        symbol,
                        side: 开仓side,
                        size: 交易数量 * (this.连续止损2 + 1),
                        text: 信号灯Type,
                    }, '自动开仓step 自动开仓 市价' + self.realData.get信号msg(symbol)) :
                    await self.limit({
                        symbol,
                        side: 开仓side,
                        size: 交易数量 * (this.连续止损2 + 1),
                        price: toBuySellPriceFunc(开仓side, () => self.realData.getOrderPrice({
                            symbol,
                            side: 开仓side,
                            type: 'taker',
                            位置: 0,
                        })),
                        text: 信号灯Type,
                    }, '自动开仓step 自动开仓 挂单' + self.realData.get信号msg(symbol))
            } else {
                return true
            }

        }



        //取消开仓
        if (活动委托.length === 1) {
            const { type, timestamp, id, side } = 活动委托[0]
            if (type === '限价') {
                const _15秒取消 = (lastNumber(self.realData.dataExt[symbol].期货.时间) > (timestamp + 15 * 1000))
                const 出现反向信号时候取消 = (信号灯Type !== 'none' && 开仓side !== side)
                if (_15秒取消 || 出现反向信号时候取消) {
                    return await self.cancel({ orderID: [id], text: '自动开仓step 取消开仓' }, '自动开仓step 取消开仓 ' + _15秒取消 ? '_15秒取消' : ('出现反向信号时候取消' + self.realData.get信号msg(symbol)))
                }
            }
        }


        return false
    }

    private 最大仓位abs = NaN
    private 最后一次开仓时间 = NaN
    private 最后一次开仓折返率 = NaN
    private 摸顶抄底超时秒 = NaN

    private async 自动止盈(self: PositionAndOrder) {

        if (self.jsonSync.rawData.symbol[symbol].任务开关.自动止盈波段 === false) {
            return true
        }

        const { 仓位数量 } = self.jsonSync.rawData.symbol[symbol]
        const 活动委托 = self.jsonSync.rawData.symbol[symbol].活动委托.filter(v => v.type !== '止损')



        if (isNaN(this.最大仓位abs) || this.最大仓位abs < Math.abs(仓位数量)) {
            this.最大仓位abs = Math.abs(仓位数量)
            this.最后一次开仓时间 = lastNumber(self.realData.dataExt[symbol].期货.时间)
            this.最后一次开仓折返率 = lastNumber(self.realData.dataExt[symbol].期货.折返率)
            this.摸顶抄底超时秒 = to范围({ min: 15, max: 30, value: self.realData.get波动率(symbol) / 7 + 15 })
        }

        if (活动委托.length <= 1) {

            const 平仓side = 仓位数量 > 0 ? 'Sell' : 'Buy'

            const get位置1价格 = () => self.realData.getOrderPrice({
                symbol,
                side: 平仓side,
                type: 'maker',
                位置: 0,
            })

            let 亏损挂单平仓Text = ''


            if (this.最后一次信号 === '摸顶' || this.最后一次信号 === '抄底') {
                if (
                    lastNumber(self.realData.dataExt[symbol].期货.时间) - this.最后一次开仓时间 >= this.摸顶抄底超时秒 * 1000 &&
                    self.get浮盈点数(symbol) < this.最后一次开仓折返率
                ) {
                    亏损挂单平仓Text = '下单' + this.摸顶抄底超时秒 + ' 秒后，折返没有超过下单点的折返函数，挂单全平'
                }
            }
            else if (this.最后一次信号 === '追涨' || this.最后一次信号 === '追跌') {
                const 净成交量均线60 = lastNumber(self.realData.dataExt[symbol].期货.净成交量均线60)

                if ((平仓side === 'Sell' && 净成交量均线60 < 0) || (平仓side === 'Buy' && 净成交量均线60 > 0)) {
                    亏损挂单平仓Text = '如果净成交量反向，那么立刻挂单平仓'
                }
                else if (lastNumber(self.realData.dataExt[symbol].期货.时间) - this.最后一次开仓时间 > 5 * 60 * 1000) {
                    亏损挂单平仓Text = '如果净成交量没有反向，那么最多等待5分钟，然后挂单平仓'
                } else {
                    //如果遇到极值点，平仓只需要两根信号
                }

            }





            if (亏损挂单平仓Text !== '') {

                if (活动委托.length === 1) {
                    if (活动委托[0].type === '限价只减仓' && 活动委托[0].side === 平仓side) {
                        if (活动委托[0].price !== get位置1价格()) {
                            return await self.updateMaker({
                                orderID: 活动委托[0].id,
                                price: toBuySellPriceFunc(平仓side, get位置1价格),
                            }, this.最后一次信号 + '平仓' + '  ' + 亏损挂单平仓Text + '  重新挂' + 平仓side + '1')
                        } else {
                            return false
                        }
                    }
                } else {
                    return await self.maker({
                        symbol,
                        side: 平仓side,
                        size: this.最大仓位abs,
                        price: toBuySellPriceFunc(平仓side, get位置1价格),
                        reduceOnly: true,
                        text: this.最后一次信号 + '平仓' + '  ' + 亏损挂单平仓Text,
                    }, '')
                }
            }


            //
            if (this.最后一次信号 === '摸顶' && self.realData.is上涨做空下跌平仓(symbol) && 活动委托.length === 0) {
                return await self.maker({
                    symbol,
                    side: 平仓side,
                    size: Math.round(this.最大仓位abs / 2),//一半
                    price: toBuySellPriceFunc(平仓side, get位置1价格),
                    reduceOnly: true,
                    text: this.最后一次信号 + '平仓' + '  ' + '自动止盈波段step 上涨做空下跌平仓一半',
                }, self.realData.get信号XXXmsg(symbol))
            }


            if (this.最后一次信号 === '抄底' && self.realData.is下跌抄底上涨平仓(symbol) && 活动委托.length === 0) {
                return await self.maker({
                    symbol,
                    side: 平仓side,
                    size: Math.round(this.最大仓位abs / 2),//一半
                    price: toBuySellPriceFunc(平仓side, get位置1价格),
                    reduceOnly: true,
                    text: this.最后一次信号 + '平仓' + '  ' + '自动止盈波段step 下跌抄底上涨平仓一半',
                }, self.realData.get信号XXXmsg(symbol))
            }



            //触发了反向开仓信号 
            const { 信号side, 信号msg } = self.realData.摸顶抄底信号灯side___2根(symbol)

            if (信号side === 平仓side && 活动委托.length === 0) {

                return await self.maker({
                    symbol,
                    side: 平仓side,
                    size: Math.round(this.最大仓位abs / 2),//一半
                    price: toBuySellPriceFunc(平仓side, get位置1价格),
                    reduceOnly: true,
                    text: this.最后一次信号 + '平仓' + '  ' + '自动止盈波段step 平一半',
                }, 信号side + ' 信号msg:' + 信号msg)

            }
        }


        return false
    }

}