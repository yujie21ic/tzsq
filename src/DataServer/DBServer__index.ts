import { syncBinanceTrades } from './syncBinanceTrades'
import { syncBitmex500msOrderBook } from './syncBitmex500msOrderBook'
import { syncBinance500ms } from './syncBinance500ms'
import { syncBitmex500msKLine } from './syncBitmex500msKLine'
import { sync1M } from './sync1M'
import { syncHopex500msKLine } from './syncHopex500msKLine'
import { DBServer } from './DBServer'

//采集
//期货
syncBitmex500msOrderBook()
syncBitmex500msKLine('XBTUSD')
syncBitmex500msKLine('ETHUSD')
sync1M('XBTUSD')
sync1M('ETHUSD')

//现货
syncBinanceTrades('btcusdt', 64975394)
syncBinanceTrades('ethusdt', 38096146)
syncBinance500ms('btcusdt')
syncBinance500ms('ethusdt')
sync1M('btcusdt')
sync1M('ethusdt')

//hopex
syncHopex500msKLine()


DBServer.run()