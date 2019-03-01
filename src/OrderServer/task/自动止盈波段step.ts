import { BaseType } from '../../lib/BaseType'
import { TradeAccount } from '../../统一接口/TradeAccount'
import { realData } from '../realData'
import { toGridPoint } from '../../lib/F/toGridPoint'
import { toBuySellPriceFunc } from '../../lib/C/toBuySellPriceFunc'
import { lastNumber } from '../../lib/F/lastNumber'
import { logToFile } from '../../lib/C/logToFile'
import { to范围 } from '../../lib/F/to范围'


const 自动止盈波段step = (symbol: BaseType.BitmexSymbol) => {
    let 止盈价格 = NaN
    let 最大仓位abs = NaN
    let 最后一次开仓时间 = NaN
    let 最后一次开仓折返率 = NaN
    let 摸顶抄底超时秒 = NaN

    return async (self: TradeAccount) => {

        if (self.jsonSync.rawData.symbol[symbol].任务开关.自动止盈波段.value === false) {
            return true
        }

        const { 仓位数量, 开仓均价 } = self.jsonSync.rawData.symbol[symbol]
        const 活动委托 = self.活动委托[symbol].filter(v => v.type !== '止损')

        if (仓位数量 !== 0) {

            if (isNaN(最大仓位abs) || 最大仓位abs < Math.abs(仓位数量)) {
                最大仓位abs = Math.abs(仓位数量)
                最后一次开仓时间 = Date.now()
                最后一次开仓折返率 = lastNumber(realData.dataExt[symbol].期货.折返率)
                摸顶抄底超时秒 = to范围({ min: 7, max: 30, value: realData.get波动率(symbol) / 7 + 7 })
                logToFile(self.bitmexPositionAndOrder.accountName + '.txt')(JSON.stringify({ 最大仓位abs, 最后一次开仓时间, 最后一次开仓折返率 }))
            }

            if (活动委托.length <= 1) {

                const 平仓side = 仓位数量 > 0 ? 'Sell' : 'Buy'

                const getPrice = () => {
                    const 止盈点 = realData.get波动率(symbol) / 3 + 3
                    const 止盈点价格 = toGridPoint(symbol, 仓位数量 > 0 ? 开仓均价 + 止盈点 : 开仓均价 - 止盈点, 平仓side)

                    const 位置1价格 = realData.getOrderPrice({
                        symbol,
                        side: 平仓side,
                        type: 'maker',
                        位置: 0,
                    })
                    return 平仓side === 'Buy' ?
                        Math.min(止盈点价格, 位置1价格) :
                        Math.max(止盈点价格, 位置1价格)
                }

                if (isNaN(止盈价格)) {
                    止盈价格 = getPrice()
                }


                const get位置1价格 = () => realData.getOrderPrice({
                    symbol,
                    side: 平仓side,
                    type: 'maker',
                    位置: 0,
                })



                const 最后一次开仓type = self.ws.增量同步数据.最后一次自动开仓.get(symbol)
                let 亏损挂单平仓Text = ''


                if (最后一次开仓type === '摸顶' || 最后一次开仓type === '抄底') {
                    if (
                        Date.now() - 最后一次开仓时间 >= 摸顶抄底超时秒 * 1000 &&
                        self.get浮盈点数(symbol) < 最后一次开仓折返率
                    ) {
                        亏损挂单平仓Text = '下单' + 摸顶抄底超时秒 + ' 秒后，折返没有超过下单点的折返函数，挂单全平'
                    }
                }
                else if (最后一次开仓type === '追涨' || 最后一次开仓type === '追跌') {
                    const 净成交量 = lastNumber(realData.dataExt[symbol].期货.净成交量)

                    if ((平仓side === 'Sell' && 净成交量 < 0) || (平仓side === 'Buy' && 净成交量 > 0)) {
                        亏损挂单平仓Text = '如果净成交量反向，那么立刻挂单平仓'
                    }
                    else if (Date.now() - 最后一次开仓时间 > 5 * 60 * 1000) {
                        亏损挂单平仓Text = '如果净成交量没有反向，那么最多等待5分钟，然后挂单平仓'
                    } else {
                        //如果遇到极值点，平仓只需要两根信号
                    }

                }





                if (亏损挂单平仓Text !== '') {

                    if (活动委托.length === 1) {
                        if (活动委托[0].type === '限价只减仓' && 活动委托[0].side === 平仓side) {
                            if (活动委托[0].price !== get位置1价格()) {
                                return await self.bitMEXOrderAPI.updateMaker({
                                    orderID: 活动委托[0].id,
                                    price: toBuySellPriceFunc(平仓side, get位置1价格),
                                    text: 最后一次开仓type + '平仓' + '  ' + 亏损挂单平仓Text + '  重新挂' + 平仓side + '1'
                                }, '', self.ws)
                            } else {
                                return false
                            }
                        }
                    } else {
                        return await self.bitMEXOrderAPI.maker({
                            symbol,
                            side: 平仓side,
                            size: 最大仓位abs,
                            price: toBuySellPriceFunc(平仓side, get位置1价格),
                            reduceOnly: true,
                            text: 最后一次开仓type + '平仓' + '  ' + 亏损挂单平仓Text,
                        }, '', self.ws)
                    }
                }


                //
                if (self.ws.增量同步数据.最后一次自动开仓.get(symbol) === '摸顶' && realData.is上涨做空下跌平仓(symbol) && 活动委托.length === 0) {
                    return await self.bitMEXOrderAPI.maker({
                        symbol,
                        side: 平仓side,
                        size: Math.round(最大仓位abs / 2),//一半
                        price: toBuySellPriceFunc(平仓side, get位置1价格),
                        reduceOnly: true,
                        text: 最后一次开仓type + '平仓' + '  ' + '自动止盈波段step 上涨做空下跌平仓一半',
                    }, realData.get信号XXXmsg(symbol), self.ws)
                }


                if (self.ws.增量同步数据.最后一次自动开仓.get(symbol) === '抄底' && realData.is下跌抄底上涨平仓(symbol) && 活动委托.length === 0) {
                    return await self.bitMEXOrderAPI.maker({
                        symbol,
                        side: 平仓side,
                        size: Math.round(最大仓位abs / 2),//一半
                        price: toBuySellPriceFunc(平仓side, get位置1价格),
                        reduceOnly: true,
                        text: 最后一次开仓type + '平仓' + '  ' + '自动止盈波段step 下跌抄底上涨平仓一半',
                    }, realData.get信号XXXmsg(symbol), self.ws)
                }



                //触发了反向开仓信号 
                const { 信号side, 信号msg } = realData.摸顶抄底信号灯side___2根(symbol)

                if (信号side === 平仓side && 活动委托.length === 0) {

                    return await self.bitMEXOrderAPI.maker({
                        symbol,
                        side: 平仓side,
                        size: Math.round(最大仓位abs / 2),//一半
                        price: toBuySellPriceFunc(平仓side, get位置1价格),
                        reduceOnly: true,
                        text: 最后一次开仓type + '平仓' + '  ' + '自动止盈波段step 平一半',
                    }, 信号side + ' 信号msg:' + 信号msg, self.ws)

                    // if (
                    //     (side === 'Buy' && get位置1价格() <= 止盈价格) ||
                    //     (side === 'Sell' && get位置1价格() >= 止盈价格)

                    // ) {

                    // } else {
                    //     return false
                    // }
                }
            }
        } else {
            止盈价格 = NaN
            最大仓位abs = NaN
            最后一次开仓时间 = NaN
            最后一次开仓折返率 = NaN
            摸顶抄底超时秒 = NaN
        }

        return false
    }
}


export const XBTUSD自动止盈波段step = () => 自动止盈波段step('XBTUSD')