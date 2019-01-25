import * as Sequelize from 'sequelize'
import { BaseType } from '../lib/BaseType'
import { toCacheFunc } from '../lib/C/toCacheFunc'

export namespace DB {

    const createSequelize = (storage: string) => {

        const sequelize = new Sequelize({
            logging: false,
            dialect: 'sqlite',
            storage,
        })

        sequelize.query('PRAGMA journal_mode=WAL;')

        return sequelize
    }


    export const getTrades = toCacheFunc(
        (symbol: BaseType.BinanceSymbol) =>
            createSequelize(`db/trades_${symbol}.db`).define<BaseType.Trade, BaseType.Trade>(symbol,
                {
                    id: { type: Sequelize.BIGINT, primaryKey: true },
                    timestamp: { type: Sequelize.BIGINT },
                    price: { type: Sequelize.DOUBLE },
                    size: { type: Sequelize.DOUBLE }, //主动买是正  主动卖是负
                },
                {
                    tableName: symbol,
                    timestamps: false,
                    indexes: [
                        { fields: ['timestamp'] },  //时间加索引
                        { fields: ['size'] },       //给单笔成交量加索引
                    ]
                }
            )
    )

    export const getKLine = toCacheFunc(
        (type: '1m' | '500ms', symbol: BaseType.BinanceSymbol | BaseType.BitmexSymbol) =>
            createSequelize(`db/${type}_${symbol}.db`).define<BaseType.KLine, BaseType.KLine>(symbol,
                {
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
                {
                    tableName: symbol,
                    timestamps: false,
                }
            )
    )


    export const getBitmex500msOrderBook = toCacheFunc(
        (symbol: BaseType.BitmexSymbol) =>
            createSequelize(`db/500msOrderBook_${symbol}.db`).define<BaseType.OrderBookDB, BaseType.OrderBookDB>(symbol,
                {
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
                {
                    tableName: symbol,
                    timestamps: false,
                }
            )
    )

}