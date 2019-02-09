import * as Sequelize from 'sequelize'
import { BaseType } from '../lib/BaseType'
import { toCacheFunc } from '../lib/C/toCacheFunc'

export namespace DB {

    const define = <T>(p: {
        storage: string
        tableName: string
        attributes: Sequelize.DefineModelAttributes<T>
        indexes?: Sequelize.DefineIndexesOptions[]
    }) => {
        const sequelize = new Sequelize({
            logging: false,
            dialect: 'sqlite',
            storage: p.storage,
        })

        sequelize.query('PRAGMA journal_mode=WAL;')

        return sequelize.define<T, T>('model', p.attributes, {
            tableName: p.tableName,//'table',
            timestamps: false,
            indexes: p.indexes,
        })
    }


    export const getTrades = toCacheFunc(
        (symbol: BaseType.BinanceSymbol) =>
            define<BaseType.Trade>({
                storage: `db/trades_${symbol}.db`,
                tableName: symbol,
                attributes: {
                    id: { type: Sequelize.BIGINT, primaryKey: true },
                    timestamp: { type: Sequelize.BIGINT },
                    price: { type: Sequelize.DOUBLE },
                    size: { type: Sequelize.DOUBLE }, //主动买是正  主动卖是负
                },
                indexes: [
                    { fields: ['timestamp'] },  //时间加索引
                    { fields: ['size'] },       //给单笔成交量加索引
                ],
            })
    )

    export const getKLine = toCacheFunc(
        (type: '1m' | '500ms', symbol: BaseType.BinanceSymbol | BaseType.BitmexSymbol) =>
            define<BaseType.KLine>({
                storage: `db/${type}_${symbol}.db`,
                tableName: symbol,
                attributes: {
                    id: { type: Sequelize.BIGINT, primaryKey: true },
                    open: { type: Sequelize.DOUBLE },
                    high: { type: Sequelize.DOUBLE },
                    low: { type: Sequelize.DOUBLE },
                    close: { type: Sequelize.DOUBLE },
                    buySize: { type: Sequelize.DOUBLE },
                    sellSize: { type: Sequelize.DOUBLE },
                    buyCount: { type: Sequelize.BIGINT },
                    sellCount: { type: Sequelize.BIGINT },
                },
            })
    )


    export const getBitmex500msOrderBook = toCacheFunc(
        (symbol: BaseType.BitmexSymbol) =>
            define<BaseType.OrderBookDB>({
                storage: `db/500msOrderBook_${symbol}.db`,
                tableName: symbol,
                attributes: {
                    id: { type: Sequelize.BIGINT, primaryKey: true },
                    buy1_price: { type: Sequelize.BIGINT },
                    buy1_size: { type: Sequelize.BIGINT },
                    sell1_price: { type: Sequelize.BIGINT },
                    sell1_size: { type: Sequelize.BIGINT },
                    buy2_price: { type: Sequelize.BIGINT },
                    buy2_size: { type: Sequelize.BIGINT },
                    sell2_price: { type: Sequelize.BIGINT },
                    sell2_size: { type: Sequelize.BIGINT },
                    buy3_price: { type: Sequelize.BIGINT },
                    buy3_size: { type: Sequelize.BIGINT },
                    sell3_price: { type: Sequelize.BIGINT },
                    sell3_size: { type: Sequelize.BIGINT },
                    buy4_price: { type: Sequelize.BIGINT },
                    buy4_size: { type: Sequelize.BIGINT },
                    sell4_price: { type: Sequelize.BIGINT },
                    sell4_size: { type: Sequelize.BIGINT },
                    buy5_price: { type: Sequelize.BIGINT },
                    buy5_size: { type: Sequelize.BIGINT },
                    sell5_price: { type: Sequelize.BIGINT },
                    sell5_size: { type: Sequelize.BIGINT },
                },
            })
    )

}