import { 回测PositionAndOrder } from './lib/____API____/PositionAndOrder/回测PositionAndOrder'
import { XBTUSD摸顶抄底追涨追跌 } from './XBTUSD摸顶抄底追涨追跌'

//  const start = new Date('2019-03-16T08:40:00')
//  const end =   new Date('2019-03-16T08:59:00')
const start = new Date('2019-03-15T12:24:00')
const end =   new Date('2019-03-16T12:28:00')

const p = new 回测PositionAndOrder(start.getTime(), end.getTime())


p.jsonSync.rawData.symbol.XBTUSD.任务开关.自动开仓抄底 = true
p.jsonSync.rawData.symbol.XBTUSD.任务开关.自动开仓摸顶 = true
p.jsonSync.rawData.symbol.XBTUSD.任务开关.自动开仓追涨 = false
p.jsonSync.rawData.symbol.XBTUSD.任务开关.自动开仓追跌 = false
p.jsonSync.rawData.symbol.XBTUSD.任务开关.自动推止损 = true
p.jsonSync.rawData.symbol.XBTUSD.任务开关.自动止盈波段 = true


p.runTask(new XBTUSD摸顶抄底追涨追跌())
