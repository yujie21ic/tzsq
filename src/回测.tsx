import { 回测PositionAndOrder } from './统一接口/PositionAndOrder/回测PositionAndOrder'
import { PositionAndOrder } from './统一接口/PositionAndOrder/PositionAndOrder'
import { XBTUSD摸顶抄底追涨追跌 } from './统一接口/task/XBTUSD摸顶抄底追涨追跌'

const start = new Date('2019-03-04T00:00:00')
const end = new Date('2019-03-04T00:01:00')

const p: PositionAndOrder = new 回测PositionAndOrder(start.getTime(), end.getTime())
p.runTask(new XBTUSD摸顶抄底追涨追跌())