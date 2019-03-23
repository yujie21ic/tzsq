import { PositionAndOrder } from './lib/____API____/PositionAndOrder/PositionAndOrder'
import { BaseType } from './lib/BaseType'
import { toBuySellPriceFunc } from './lib/C/toBuySellPriceFunc'
import { lastNumber } from './lib/F/lastNumber'
import { to范围 } from './lib/F/to范围'
import { toGridPoint } from './lib/F/toGridPoint'
import { PositionAndOrderTask } from './lib/____API____/PositionAndOrder/PositionAndOrder'
import { config } from './config'

const 交易数量 = config.量化数量 || 2

const 推止损 = (p: { 波动率: number, 盈利点: number, type: '摸顶' | '抄底' | '追涨' | '追跌' | 'none' }) => {
    if (p.type === '追涨' || p.type === '追跌') {
        if (p.盈利点 >= 10) {
            return 5
        }
        else if (p.盈利点 >= 3) {
            return 0
        }
        else {
            return NaN
        }
    } else {
        if (p.盈利点 >= to范围({ min: 5, max: 30, value: p.波动率 / 5 + 15 })) {
            return 5
        }
        else if (p.盈利点 >= to范围({ min: 5, max: 15, value: p.波动率 / 8 + 6 })) {
            return 0
        }
        else {
            return NaN
        }
    }
} 

export class XBTUSD摸顶抄底追涨追跌 implements PositionAndOrderTask {

    止损step(self: PositionAndOrder) {
        const { 仓位数量, 开仓均价 } = self.jsonSync.rawData.symbol['XBTUSD']
        const 止损委托 = self.jsonSync.rawData.symbol['XBTUSD'].活动委托.filter(v => v.type === '止损')

        const 波动率 = self.realData.get波动率('XBTUSD')

        //没有止损 
        if (止损委托.length === 0) {
            //有仓位 初始化止损
            if (仓位数量 !== 0) {

                const 止损点 = to范围({
                    min: 4,
                    max: 18,
                    value: 波动率 / 10 + 4,
                })

                if (isNaN(止损点)) return false //波动率还没出来 不止损

                const side = 仓位数量 > 0 ? 'Sell' : 'Buy'

                this.最后一次止损状态 = '亏损止损'
                return self.stop({
                    symbol: 'XBTUSD',
                    side,
                    price: toGridPoint('XBTUSD', 仓位数量 > 0 ? 开仓均价 - 止损点 : 开仓均价 + 止损点, side),
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
                return self.cancel({ orderID: 止损委托.map(v => v.id), text: '止损step 取消止损' })
            }
            else {
                if (self.jsonSync.rawData.symbol['XBTUSD'].任务开关.自动推止损 === false) return false //自动推止损 任务没打开

                //修改止损  只能改小  不能改大
                const { price, side, id } = 止损委托[0]
                const 浮盈点数 = self.get浮盈点数('XBTUSD')

                const 推 = 推止损({
                    波动率: self.realData.get波动率('XBTUSD'),
                    盈利点: 浮盈点数,
                    type: this.最后一次信号
                })

                if (isNaN(推)) {
                    return false
                }

                const 新的Price = toGridPoint('XBTUSD', 开仓均价 + (side === 'Buy' ? - 推 : 推), side)

                if (
                    (side === 'Buy' && 新的Price < price) ||
                    (side === 'Sell' && 新的Price > price)
                ) {
                    this.最后一次止损状态 = 推 === 0 ? '成本价止损' : '盈利止损'
                    return self.updateStop({
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
            return self.cancel({ orderID: 止损委托.map(v => v.id), text: '止损step 取消多个止损' })
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

    onTick(self: PositionAndOrder) {
        const { 仓位数量 } = self.jsonSync.rawData.symbol['XBTUSD']

        //委托检测
        const 活动委托 = self.jsonSync.rawData.symbol['XBTUSD'].活动委托.filter(v => v.type !== '止损')

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
                return self.cancel({ orderID: 活动委托.map(v => v.id), text: '委托检测step 取消委托' }, 活动委托[0].type)
            }
        }
        else {
            //多个委托  全部给取消  
            return self.cancel({ orderID: 活动委托.map(v => v.id), text: '委托检测step 取消多个委托' }, 活动委托.map(v => v.type).join(','))
        }



        //止损
        const x = this.止损step(self)
        if (x) {
            return true
        }



        if (仓位数量 === 0) {
            this.最大仓位abs = NaN
            this.最后一次开仓时间 = NaN
            this.最后一次开仓折返率 = NaN
            this.摸顶抄底超时秒 = NaN
            this.第2次超时 = false
            this.已经平了一半了 = false
            return this.自动开仓(self)
        } else {
            return this.自动止盈(self)
        }
    }


    private 最后一次信号 = 'none' as 'none' | '追涨' | '追跌' | '摸顶' | '抄底'
    private 最后一次信号时间 = 0
    private 最后一次上涨_下跌 = ''
    private 到什么时间不开仓 = 0

    private 自动开仓(self: PositionAndOrder) {

        if (self.jsonSync.rawData.symbol['XBTUSD'].任务开关.自动开仓追涨 === false
            && self.jsonSync.rawData.symbol['XBTUSD'].任务开关.自动开仓追跌 === false
            && self.jsonSync.rawData.symbol['XBTUSD'].任务开关.自动开仓抄底 === false
            && self.jsonSync.rawData.symbol['XBTUSD'].任务开关.自动开仓摸顶 === false) return false

        const { 仓位数量 } = self.jsonSync.rawData.symbol['XBTUSD']

        const 本地维护仓位数量 = self.get本地维护仓位数量('XBTUSD')

        const 活动委托 = self.jsonSync.rawData.symbol['XBTUSD'].活动委托.filter(v => v.type !== '止损')

        const 信号灯Type = self.realData.get信号灯Type('XBTUSD')
        const 开仓side = { '追涨': 'Buy', '追跌': 'Sell', '抄底': 'Buy', '摸顶': 'Sell', 'none': '_____' }[信号灯Type] as BaseType.Side

        //上涨 下跌 切换 止损次数 清零
        const x = self.realData.dataExt['XBTUSD'].bitmex.上涨_下跌_横盘
        if (x.length > 0 && this.最后一次上涨_下跌 !== x[x.length - 1]) {
            this.最后一次上涨_下跌 = x[x.length - 1]
            this.连续止损2 = 0
        }

        if (this.连续止损2 >= 4) {
            this.到什么时间不开仓 = lastNumber(self.realData.dataExt['XBTUSD'].bitmex.时间) + 1000 * 60 * 10
            this.连续止损2 = 0
        }

        //开仓
        if (本地维护仓位数量 === 0 && 仓位数量 === 0 && 活动委托.length === 0 && 信号灯Type !== 'none') {

            if (信号灯Type === '追涨' && self.jsonSync.rawData.symbol['XBTUSD'].任务开关.自动开仓追涨 === false) return false
            if (信号灯Type === '追跌' && self.jsonSync.rawData.symbol['XBTUSD'].任务开关.自动开仓追跌 === false) return false
            if (信号灯Type === '抄底' && self.jsonSync.rawData.symbol['XBTUSD'].任务开关.自动开仓抄底 === false) return false
            if (信号灯Type === '摸顶' && self.jsonSync.rawData.symbol['XBTUSD'].任务开关.自动开仓摸顶 === false) return false
            if (
                (lastNumber(self.realData.dataExt['XBTUSD'].bitmex.时间) - this.最后一次信号时间 < 20 * 1000) && //没有超时
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
            this.最后一次信号时间 = lastNumber(self.realData.dataExt['XBTUSD'].bitmex.时间)


            const 市价 = 信号灯Type === '追涨' || 信号灯Type === '追跌' || lastNumber(self.realData.dataExt.XBTUSD.bitmex.绝对价差) > 15


            if (lastNumber(self.realData.dataExt['XBTUSD'].bitmex.时间) > this.到什么时间不开仓) {
                return 市价 ?
                    self.taker({
                        symbol: 'XBTUSD',
                        side: 开仓side,
                        size: 交易数量 * (this.连续止损2 + 1),
                        text: 信号灯Type,
                    }, '自动开仓step 自动开仓 市价' + self.realData.get信号msg('XBTUSD')) :
                    self.maker({
                        symbol: 'XBTUSD',
                        side: 开仓side,
                        size: 交易数量 * (this.连续止损2 + 1),
                        price: toBuySellPriceFunc(开仓side, () => self.realData.getOrderPrice({
                            symbol: 'XBTUSD',
                            side: 开仓side,
                            type: 'maker',
                            位置: 0,
                        })),
                        reduceOnly: false,
                        text: 信号灯Type,
                    }, '自动开仓step 自动开仓 挂单' + self.realData.get信号msg('XBTUSD'))
            } else {
                return true
            }

        }



        //取消开仓
        if (活动委托.length === 1) {
            const { type, timestamp, id, side } = 活动委托[0]
            if (type === '限价') {
                const _15秒取消 = (lastNumber(self.realData.dataExt['XBTUSD'].bitmex.时间) > (timestamp + 15 * 1000))
                const 出现反向信号时候取消 = (信号灯Type !== 'none' && 开仓side !== side)
                if (_15秒取消 || 出现反向信号时候取消) {
                    return self.cancel({ orderID: [id], text: '自动开仓step 取消开仓' }, '自动开仓step 取消开仓 ' + _15秒取消 ? '_15秒取消' : ('出现反向信号时候取消' + self.realData.get信号msg('XBTUSD')))
                }
            }
        }


        return false
    }

    private 最大仓位abs = NaN
    private 最后一次开仓时间 = NaN
    private 最后一次开仓折返率 = NaN
    private 摸顶抄底超时秒 = NaN
    private 第2次超时 = false
    private 已经平了一半了 = false

    private 自动止盈(self: PositionAndOrder) {

        if (self.jsonSync.rawData.symbol['XBTUSD'].任务开关.自动止盈波段 === false) {
            return true
        }

        const { 仓位数量 } = self.jsonSync.rawData.symbol['XBTUSD']
        const 活动委托 = self.jsonSync.rawData.symbol['XBTUSD'].活动委托.filter(v => v.type !== '止损')



        if (isNaN(this.最大仓位abs) || this.最大仓位abs < Math.abs(仓位数量)) {
            this.最大仓位abs = Math.abs(仓位数量)
            this.最后一次开仓时间 = lastNumber(self.realData.dataExt['XBTUSD'].bitmex.时间)
            this.最后一次开仓折返率 = lastNumber(self.realData.dataExt['XBTUSD'].bitmex.折返率)
            this.摸顶抄底超时秒 = to范围({ min: 15, max: 30, value: self.realData.get波动率('XBTUSD') / 7 + 20 })
            this.第2次超时 = false
            this.已经平了一半了 = false
        }



        const 持仓时间ms = lastNumber(self.realData.dataExt['XBTUSD'].bitmex.时间) - this.最后一次开仓时间


        if (活动委托.length <= 1) {

            if (持仓时间ms < 10 * 1000) return false

            const 平仓side = 仓位数量 > 0 ? 'Sell' : 'Buy'

            const get位置1价格 = () => self.realData.getOrderPrice({
                symbol: 'XBTUSD',
                side: 平仓side,
                type: 'maker',
                位置: 0,
            })

            const 震荡指数衰竭 = lastNumber(self.realData.dataExt['XBTUSD'].bitmex.震荡指数_macd.DIF) < lastNumber(self.realData.dataExt['XBTUSD'].bitmex.震荡指数_macd.DEM)
            //如果超时了 
            if (持仓时间ms >= this.摸顶抄底超时秒 * 1000 && this.第2次超时 === false) {
                this.第2次超时 = true
                if (!震荡指数衰竭) { //dif>dem 
                    this.摸顶抄底超时秒 = 15
                }
            }


            // console.log("最后一次信号"+this.最后一次信号)
            // console.log("最后一次信号"+this.摸顶抄底超时秒)
            // console.log("get浮盈点数"+ self.get浮盈点数(symbol))
            // console.log("最后一次开仓折返率"+this.最后一次开仓折返率)
            // console.log("--------------------------------------------")
            let 亏损挂单平仓Text = ''


            if (this.最后一次信号 === '摸顶' || this.最后一次信号 === '抄底') {
                const 折返 = self.get浮盈点数('XBTUSD') < this.最后一次开仓折返率
                if (
                    (折返 && 震荡指数衰竭 === true && 持仓时间ms >= this.摸顶抄底超时秒 * 1000) ||      // 折返函数&&震荡衰竭==true的超时时间是30s
                    (折返 && 震荡指数衰竭 === false && 持仓时间ms >= this.摸顶抄底超时秒 * 120 * 1000)  // 折返函数&&震荡衰竭==false的超时时间是2分钟
                ) {
                    亏损挂单平仓Text = '下单' + this.摸顶抄底超时秒 + ' 秒后，折返没有超过下单点的折返函数，并且震荡指数衰竭，挂单全平'
                }
            }
            else if (this.最后一次信号 === '追涨' || this.最后一次信号 === '追跌') {
                const 净成交量均线60 = lastNumber(self.realData.dataExt['XBTUSD'].bitmex.买.净成交量_累加60)

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
                        if (活动委托[0].price !== get位置1价格()) {
                            return self.updateMaker({
                                orderID: 活动委托[0].id,
                                price: toBuySellPriceFunc(平仓side, get位置1价格),
                            }, this.最后一次信号 + '平仓' + '  ' + 亏损挂单平仓Text + '  重新挂' + 平仓side + '1')
                        } else {
                            return false
                        }
                    }
                } else {
                    return self.maker({
                        symbol: 'XBTUSD',
                        side: 平仓side,
                        size: this.最大仓位abs,
                        price: toBuySellPriceFunc(平仓side, get位置1价格),
                        reduceOnly: true,
                        text: this.最后一次信号 + '平仓' + '  ' + 亏损挂单平仓Text,
                    }, '')
                }
            }


            //平一半
            if (this.已经平了一半了 === false) {
                if (this.最后一次信号 === '摸顶' && self.realData.is摸顶_下跌平仓('XBTUSD') && 活动委托.length === 0) {
                    this.已经平了一半了 = true
                    return self.maker({
                        symbol: 'XBTUSD',
                        side: 平仓side,
                        size: Math.round(this.最大仓位abs / 2),//一半
                        price: toBuySellPriceFunc(平仓side, get位置1价格),
                        reduceOnly: true,
                        text: this.最后一次信号 + '平仓' + '  ' + '自动止盈波段step 上涨做空下跌平仓一半',
                    }, self.realData.get信号XXXmsg('XBTUSD'))
                }


                if (this.最后一次信号 === '抄底' && self.realData.is抄底_上涨平仓('XBTUSD') && 活动委托.length === 0) {
                    this.已经平了一半了 = true
                    return self.maker({
                        symbol: 'XBTUSD',
                        side: 平仓side,
                        size: Math.round(this.最大仓位abs / 2),//一半
                        price: toBuySellPriceFunc(平仓side, get位置1价格),
                        reduceOnly: true,
                        text: this.最后一次信号 + '平仓' + '  ' + '自动止盈波段step 下跌抄底上涨平仓一半',
                    }, self.realData.get信号XXXmsg('XBTUSD'))
                }
            }


            //触发了反向开仓信号 
            const { 信号side, 信号msg } = self.realData.摸顶抄底信号灯side___2根('XBTUSD')

            if (信号side === 平仓side && 活动委托.length === 0) {

                const 市价 = lastNumber(self.realData.dataExt.XBTUSD.bitmex.绝对价差) > 15

                return 市价 ?
                    self.taker({
                        symbol: 'XBTUSD',
                        side: 平仓side,
                        size: Math.abs(仓位数量),
                        text: this.最后一次信号 + '平仓' + ' 触发了反向开仓信号  ' + '自动止盈波段step 全部止盈',
                    }, 信号side + ' 信号msg:' + 信号msg) :
                    self.maker({
                        symbol: 'XBTUSD',
                        side: 平仓side,
                        size: Math.abs(仓位数量),
                        price: toBuySellPriceFunc(平仓side, get位置1价格),
                        reduceOnly: true,
                        text: this.最后一次信号 + '平仓' + ' 触发了反向开仓信号  ' + '自动止盈波段step 全部止盈',
                    }, 信号side + ' 信号msg:' + 信号msg)

            }
        }


        return false
    }

}