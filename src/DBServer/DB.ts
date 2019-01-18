import * as Sequelize from 'sequelize'
import { BaseType } from '../lib/BaseType'

export namespace DB {
    //_________________________________________________________________________________//
    const _getTrades_dic: { [symbol: string]: Sequelize.Model<BaseType.Trade, BaseType.Trade> } = Object.create(null)

    export const getTrades = (symbol: BaseType.BinanceSymbol) => {

        if (_getTrades_dic[symbol] === undefined) {

            const sequelize = new Sequelize({
                logging: false,
                dialect: 'sqlite',
                storage: `db/trades_${symbol}.db`
            })

            sequelize.query('PRAGMA journal_mode=WAL;')

            const table = sequelize.define<BaseType.Trade, BaseType.Trade>(symbol,
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
                        { fields: ['size'] }        //给单笔成交量加索引
                    ]
                }
            )
            _getTrades_dic[symbol] = table
        }

        return _getTrades_dic[symbol]
    }


    //_________________________________________________________________________________//
    const _getKLine_dic: { [type_symbol: string]: Sequelize.Model<BaseType.KLine, BaseType.KLine> } = Object.create(null)

    export const getKLine = (type: '1m' | '500ms', symbol: BaseType.BinanceSymbol | BaseType.BitmexSymbol) => {

        if (_getKLine_dic[`${type}_${symbol}`] === undefined) {

            const sequelize = new Sequelize({
                logging: false,
                dialect: 'sqlite',
                storage: `db/${type}_${symbol}.db`
            })

            sequelize.query('PRAGMA journal_mode=WAL;')

            const table = sequelize.define<BaseType.KLine, BaseType.KLine>(symbol,
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
                    timestamps: false
                }
            )
            _getKLine_dic[symbol] = table
        }

        return _getKLine_dic[symbol]
    }

    //_________________________________________________________________________________//
    const _getBitmex500msOrderBook_dic: { [symbol: string]: Sequelize.Model<BaseType.OrderBookDB, BaseType.OrderBookDB> } = Object.create(null)

    export const getBitmex500msOrderBook = (symbol: BaseType.BitmexSymbol) => {

        if (_getBitmex500msOrderBook_dic[symbol] === undefined) {

            const sequelize = new Sequelize({
                logging: false,
                dialect: 'sqlite',
                storage: `db/500msOrderBook_${symbol}.db`
            })

            sequelize.query('PRAGMA journal_mode=WAL;')

            const table = sequelize.define<BaseType.OrderBookDB, BaseType.OrderBookDB>(symbol,
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
                    timestamps: false
                }
            )
            _getBitmex500msOrderBook_dic[symbol] = table
        }

        return _getBitmex500msOrderBook_dic[symbol]
    }
}