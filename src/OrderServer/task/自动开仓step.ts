import { BaseType } from '../../lib/BaseType'
import { TradeAccount } from '../../统一接口/TradeAccount'
import { realData, get信号msg, get信号灯Type, get波动率 } from '../realData'
import { toBuySellPriceFunc } from '../../lib/C/toBuySellPriceFunc'
import { sleep } from '../../lib/C/sleep'
import { task__config } from './task__config'


const 自动开仓step = (symbol: BaseType.BitmexSymbol) => {

    let 最后一次信号 = 'none' as 'none' | '追涨' | '追跌' | '摸顶' | '抄底'
    let 最后一次信号时间 = 0
    let 最后一次上涨_下跌 = ''

    return async (self: TradeAccount) => {


        if (self.jsonSync.rawData.symbol[symbol].任务开关.自动开仓追涨.value === false
            && self.jsonSync.rawData.symbol[symbol].任务开关.自动开仓追跌.value === false
            && self.jsonSync.rawData.symbol[symbol].任务开关.自动开仓抄底.value === false
            && self.jsonSync.rawData.symbol[symbol].任务开关.自动开仓摸顶.value === false) return false

        const { 仓位数量 } = self.jsonSync.rawData.symbol[symbol]

        const 本地维护仓位数量 = self.ws.增量同步数据.仓位数量.get(symbol)

        const 活动委托 = self.活动委托[symbol].filter(v => v.type !== '止损')

        const 信号灯Type = get信号灯Type(symbol)
        const 开仓side = { '追涨': 'Buy', '追跌': 'Sell', '抄底': 'Buy', '摸顶': 'Sell', 'none': '_____' }[信号灯Type] as BaseType.Side

        //上涨 下跌 切换 止损次数 清零
        const x = realData.dataExt[symbol].期货.上涨_下跌
        if (x.length > 0 && 最后一次上涨_下跌 !== x[x.length - 1]) {
            最后一次上涨_下跌 = x[x.length - 1]
            self.ws.增量同步数据.连续止损.partial(symbol, 0)
        }

        const 连续止损次数 = self.ws.增量同步数据.连续止损.get(symbol)

        if (连续止损次数 >= 4) {
            await sleep(1000 * 60 * 10)//10min
            self.ws.增量同步数据.连续止损.partial(symbol, 0)
            return true
        }

        //开仓
        if (本地维护仓位数量 === 0 && 仓位数量 === 0 && 活动委托.length === 0 && 信号灯Type !== 'none') {

            if (信号灯Type === '追涨' && self.jsonSync.rawData.symbol[symbol].任务开关.自动开仓追涨.value === false) return false
            if (信号灯Type === '追跌' && self.jsonSync.rawData.symbol[symbol].任务开关.自动开仓追跌.value === false) return false
            if (信号灯Type === '抄底' && self.jsonSync.rawData.symbol[symbol].任务开关.自动开仓抄底.value === false) return false
            if (信号灯Type === '摸顶' && self.jsonSync.rawData.symbol[symbol].任务开关.自动开仓摸顶.value === false) return false

            const x = 最后一次信号
            最后一次信号 = 信号灯Type
            最后一次信号时间 = Date.now()

            if (
                (Date.now() - 最后一次信号时间 < 20 * 1000) && //没有超时
                (                                             //抵消
                    (x === '追涨' && 信号灯Type === '摸顶') ||
                    (x === '追跌' && 信号灯Type === '抄底') ||
                    (x === '抄底' && 信号灯Type === '追跌') ||
                    (x === '摸顶' && 信号灯Type === '追涨')
                )
            ) {
                return false
            }



            const 市价 = 信号灯Type === '追涨' || 信号灯Type === '追跌' || get波动率(symbol) < 30

            return 市价 ?
                await self.order自动.taker({
                    symbol,
                    side: 开仓side,
                    size: task__config.交易数量 * (连续止损次数 + 1),
                    text: 信号灯Type,
                }, '自动开仓step 自动开仓 市价' + get信号msg(symbol), self.ws) :
                await self.order自动.limit({
                    symbol,
                    side: 开仓side,
                    size: task__config.交易数量 * (连续止损次数 + 1),
                    price: toBuySellPriceFunc(开仓side, () => realData.getOrderPrice({
                        symbol,
                        side: 开仓side,
                        type: 'taker',
                        位置: 0,
                    })) as any,
                    text: 信号灯Type,
                }, '自动开仓step 自动开仓 挂单' + get信号msg(symbol), self.ws)
        }



        //取消开仓
        if (活动委托.length === 1) {
            const { type, timestamp, id, side } = 活动委托[0]
            if (type === '限价') {
                const _15秒取消 = (Date.now() > (timestamp + 15 * 1000))
                const 出现反向信号时候取消 = (信号灯Type !== 'none' && 开仓side !== side)
                if (_15秒取消 || 出现反向信号时候取消) {
                    return await self.order自动.cancel({ orderID: [id], text: '自动开仓step 取消开仓' }, '自动开仓step 取消开仓 ' + _15秒取消 ? '_15秒取消' : ('出现反向信号时候取消' + get信号msg(symbol)))
                }
            }
        }


        return false
    }

}


export const XBTUSD自动开仓step = () => 自动开仓step('XBTUSD') 