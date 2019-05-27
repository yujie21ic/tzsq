import * as Sequelize from 'sequelize'
import { JSONRPCServer } from '../F/JSONRPC'
import { BaseType } from '../BaseType'
import { DBServer__funcList } from './DBServer__funcList'
import { DB } from './DB'
import { timeID } from '../F/timeID'

export const DBServer = new JSONRPCServer({
    funcList: DBServer__funcList,
    port: 5555
})

DBServer.func.getKLine = async req => {
    const timeFunc = req.type === '1m' ? timeID._60s.toID : timeID._500ms.toID
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

