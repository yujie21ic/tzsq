import * as Sequelize from 'sequelize'
import { JSONRPCServer } from '../lib/C/JSONRPC'
import { BaseType } from '../lib/BaseType'
import { funcList } from './funcList'
import { DB } from './DB'
import { syncBinanceTrades } from './syncBinanceTrades'
import { syncBitmex500msOrderBook } from '../PKServer/syncBitmex500msOrderBook'
import { syncBinance500ms } from './syncBinance500ms'
import { timeID } from '../lib/F/timeID'
import { syncBitmex500msKLine } from './syncBitmex500msKLine'
import { sync1M } from './sync1M'
import { syncHopex500msKLine } from './syncHopex500msKLine'

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


//
const server = new JSONRPCServer({
    funcList,
    port: 5555
})
server.run()


server.func.getKLine = async req => {
    const timeFunc = req.type === '1m' ? timeID.timestampToOneMinuteID : timeID.timestampTo500msID
    const retData = await DB.getKLine(req.type, req.symbol).findAll<{}>({
        raw: true,
        where: {
            id: {
                [Sequelize.Op.gte]: timeFunc(req.startTime),
                [Sequelize.Op.lte]: timeFunc(req.endTime),
            }
        },
        order: ['id'],
    }) as BaseType.KLine[]
    return retData
}

