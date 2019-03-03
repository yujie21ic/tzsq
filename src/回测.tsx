import { 回测PositionAndOrder } from './统一接口/PositionAndOrder/回测PositionAndOrder'
import { PositionAndOrder } from './统一接口/PositionAndOrder/PositionAndOrder'
import { XBTUSD摸顶抄底追涨追跌 } from './统一接口/task/XBTUSD摸顶抄底追涨追跌'


const p: PositionAndOrder = new 回测PositionAndOrder(0, 0)
p.runTask(new XBTUSD摸顶抄底追涨追跌())