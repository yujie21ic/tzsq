import * as Sequelize from 'sequelize'
import { JSONRPCServer } from '../lib/C/JSONRPC'
import { PKServer__funcList } from './PKServer__funcList'
import { DB } from '../DBServer/DB'
import { timeID } from '../lib/F/timeID'

export const PKServer = new JSONRPCServer({
    funcList: PKServer__funcList,
    port: 5555
})

PKServer.func.getBitmex500msOrderBook = async req => {
    const arr = await DB.getBitmex500msOrderBook(req.symbol).findAll<{}>({
        raw: true,
        where: {
            id: {
                [Sequelize.Op.gte]: timeID.timestampTo500msID(req.startTime),
                [Sequelize.Op.lte]: timeID.timestampTo500msID(req.endTime),
            }
        },
        order: ['id'],
    })
    return arr.map(v => ({
        id: v.id,
        buy: [
            {
                price: v.buy1_price,
                size: v.buy1_size,
            },
            {
                price: v.buy2_price,
                size: v.buy2_size,
            },
            {
                price: v.buy3_price,
                size: v.buy3_size,
            },
            {
                price: v.buy4_price,
                size: v.buy4_size,
            },
            {
                price: v.buy5_price,
                size: v.buy5_size,
            },
        ],
        sell: [
            {
                price: v.sell1_price,
                size: v.sell1_size,
            },
            {
                price: v.sell2_price,
                size: v.sell2_size,
            },
            {
                price: v.sell3_price,
                size: v.sell3_size,
            },
            {
                price: v.sell4_price,
                size: v.sell4_size,
            },
            {
                price: v.sell5_price,
                size: v.sell5_size,
            },
        ],
    }))
}