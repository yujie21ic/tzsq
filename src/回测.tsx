import { 回测PositionAndOrder } from './统一接口/PositionAndOrder/回测PositionAndOrder'
import { XBTUSD摸顶抄底追涨追跌 } from './统一接口/task/XBTUSD摸顶抄底追涨追跌'

const start = new Date('2019-02-27T03:00:00')
const end = new Date('2019-02-28T03:00:00')

const p = new 回测PositionAndOrder(start.getTime(), end.getTime())


p.jsonSync.rawData.symbol.XBTUSD.任务开关.自动开仓抄底 = true
p.jsonSync.rawData.symbol.XBTUSD.任务开关.自动开仓摸顶 = true
p.jsonSync.rawData.symbol.XBTUSD.任务开关.自动开仓追涨 = false
p.jsonSync.rawData.symbol.XBTUSD.任务开关.自动开仓追跌 = false
p.jsonSync.rawData.symbol.XBTUSD.任务开关.自动推止损 = true
p.jsonSync.rawData.symbol.XBTUSD.任务开关.自动止盈波段 = true


p.runTask(new XBTUSD摸顶抄底追涨追跌())
