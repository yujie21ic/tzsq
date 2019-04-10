
//greate by https://www.bitmex.com/api/explorer/swagger.json

import { BitMEXMessage } from './BitMEXMessage'
import { queryStringStringify } from '../../F/queryStringStringify'
import { JSONRequest } from '../../F/JSONRequest'
import { config } from '../../../config'

const f = async <T>(obj: { method: string, path: string, cookie: string, req: any }) => {

    const { method, req } = obj

    const url = 'https://www.bitmex.com' + (
        (method === 'GET' || method === 'DELETE') ?
            (obj.path + '?' + queryStringStringify(req)) :
            obj.path
    )

    const body = (method === 'GET' || method === 'DELETE') ? undefined : req

    return await JSONRequest<T>({
        headers: obj.cookie === '' ? undefined : {
            Cookie: obj.cookie,
            Referer: 'https://www.bitmex.com/app/trade/XBTUSD',
        },
        url,
        method,
        body,
        ss: config.ss
    })
}

export const BitMEXHTTP = {

    Announcement: {

        get: (cookie: string, req: {
            columns?: string /* 'JSON'  Array of column names to fetch. If omitted, will return all columns.*/
        }) => f<BitMEXMessage.Announcement[]>({ cookie, method: 'GET', path: '/api/v1/announcement', req }),

        getUrgent: (cookie: string, req: {}) => f<BitMEXMessage.Announcement[]>({ cookie, method: 'GET', path: '/api/v1/announcement/urgent', req })
    },

    APIKey: {

        new: (cookie: string, req: {
            name?: string /* ''  Key name. This name is for reference only.*/
            cidr?: string /* ''  CIDR block to restrict this key to. To restrict to a single address, append "/32", e.g. 207.39.29.22/32. Leave blank or set to 0.0.0.0/0 to allow all IPs. Only one block may be set. <a href="http://software77.net/cidr-101.html">More on CIDR blocks</a>*/
            permissions?: string /* 'JSON'  Key Permissions. All keys can read margin and position data. Additional permissions must be added. Available: ["order", "orderCancel", "withdraw"].*/
            enabled?: boolean /* ''  Set to true to enable this key on creation. Otherwise, it must be explicitly enabled via /apiKey/enable.*/
            token?: string /* ''  OTP Token (YubiKey, Google Authenticator)*/
        }) => f<BitMEXMessage.APIKey>({ cookie, method: 'POST', path: '/api/v1/apiKey', req }),

        get: (cookie: string, req: {
            reverse?: boolean /* ''  If true, will sort results newest first.*/
        }) => f<BitMEXMessage.APIKey[]>({ cookie, method: 'GET', path: '/api/v1/apiKey', req }),

        remove: (cookie: string, req: {
            apiKeyID: string /* ''  API Key ID (public component).*/
        }) => f<{ success: boolean }>({ cookie, method: 'DELETE', path: '/api/v1/apiKey', req }),

        disable: (cookie: string, req: {
            apiKeyID: string /* ''  API Key ID (public component).*/
        }) => f<BitMEXMessage.APIKey>({ cookie, method: 'POST', path: '/api/v1/apiKey/disable', req }),

        enable: (cookie: string, req: {
            apiKeyID: string /* ''  API Key ID (public component).*/
        }) => f<BitMEXMessage.APIKey>({ cookie, method: 'POST', path: '/api/v1/apiKey/enable', req })
    },

    Chat: {

        get: (cookie: string, req: {
            count?: number /* 'int32'  Number of results to fetch.*/
            start?: number /* 'int32'  Starting ID for results.*/
            reverse?: boolean /* ''  If true, will sort results newest first.*/
            channelID?: number /* 'double'  Channel id. GET /chat/channels for ids. Leave blank for all.*/
        }) => f<BitMEXMessage.Chat[]>({ cookie, method: 'GET', path: '/api/v1/chat', req }),

        new: (cookie: string, req: {
            message: string /* ''  */
            channelID?: number /* 'double'  Channel to post to. Default 1 (English).*/
        }) => f<BitMEXMessage.Chat>({ cookie, method: 'POST', path: '/api/v1/chat', req }),

        getChannels: (cookie: string, req: {}) => f<BitMEXMessage.ChatChannel[]>({ cookie, method: 'GET', path: '/api/v1/chat/channels', req }),

        getConnected: (cookie: string, req: {}) => f<BitMEXMessage.ConnectedUsers>({ cookie, method: 'GET', path: '/api/v1/chat/connected', req })
    },

    Execution: {

        get: (cookie: string, req: {
            symbol?: string /* ''  Instrument symbol. Send a bare series (e.g. XBU) to get data for the nearest expiring contract in that series.

You can also send a timeframe, e.g. `XBU:monthly`. Timeframes are `daily`, `weekly`, `monthly`, `quarterly`, and `biquarterly`.*/
            filter?: string /* 'JSON'  Generic table filter. Send JSON key/value pairs, such as `{"key": "value"}`. You can key on individual fields, and do more advanced querying on timestamps. See the [Timestamp Docs](https://www.bitmex.com/app/restAPI#Timestamp-Filters) for more details.*/
            columns?: string /* 'JSON'  Array of column names to fetch. If omitted, will return all columns.

Note that this method will always return item keys, even when not specified, so you may receive more columns that you expect.*/
            count?: number /* 'int32'  Number of results to fetch.*/
            start?: number /* 'int32'  Starting point for results.*/
            reverse?: boolean /* ''  If true, will sort results newest first.*/
            startTime?: string /* 'date-time'  Starting date filter for results.*/
            endTime?: string /* 'date-time'  Ending date filter for results.*/
        }) => f<BitMEXMessage.Execution[]>({ cookie, method: 'GET', path: '/api/v1/execution', req }),

        getTradeHistory: (cookie: string, req: {
            symbol?: string /* ''  Instrument symbol. Send a bare series (e.g. XBU) to get data for the nearest expiring contract in that series.

You can also send a timeframe, e.g. `XBU:monthly`. Timeframes are `daily`, `weekly`, `monthly`, `quarterly`, and `biquarterly`.*/
            filter?: string /* 'JSON'  Generic table filter. Send JSON key/value pairs, such as `{"key": "value"}`. You can key on individual fields, and do more advanced querying on timestamps. See the [Timestamp Docs](https://www.bitmex.com/app/restAPI#Timestamp-Filters) for more details.*/
            columns?: string /* 'JSON'  Array of column names to fetch. If omitted, will return all columns.

Note that this method will always return item keys, even when not specified, so you may receive more columns that you expect.*/
            count?: number /* 'int32'  Number of results to fetch.*/
            start?: number /* 'int32'  Starting point for results.*/
            reverse?: boolean /* ''  If true, will sort results newest first.*/
            startTime?: string /* 'date-time'  Starting date filter for results.*/
            endTime?: string /* 'date-time'  Ending date filter for results.*/
        }) => f<BitMEXMessage.Execution[]>({ cookie, method: 'GET', path: '/api/v1/execution/tradeHistory', req })
    },

    Funding: {

        get: (cookie: string, req: {
            symbol?: string /* ''  Instrument symbol. Send a bare series (e.g. XBU) to get data for the nearest expiring contract in that series.

You can also send a timeframe, e.g. `XBU:monthly`. Timeframes are `daily`, `weekly`, `monthly`, `quarterly`, and `biquarterly`.*/
            filter?: string /* 'JSON'  Generic table filter. Send JSON key/value pairs, such as `{"key": "value"}`. You can key on individual fields, and do more advanced querying on timestamps. See the [Timestamp Docs](https://www.bitmex.com/app/restAPI#Timestamp-Filters) for more details.*/
            columns?: string /* 'JSON'  Array of column names to fetch. If omitted, will return all columns.

Note that this method will always return item keys, even when not specified, so you may receive more columns that you expect.*/
            count?: number /* 'int32'  Number of results to fetch.*/
            start?: number /* 'int32'  Starting point for results.*/
            reverse?: boolean /* ''  If true, will sort results newest first.*/
            startTime?: string /* 'date-time'  Starting date filter for results.*/
            endTime?: string /* 'date-time'  Ending date filter for results.*/
        }) => f<BitMEXMessage.Funding[]>({ cookie, method: 'GET', path: '/api/v1/funding', req })
    },

    Instrument: {

        get: (cookie: string, req: {
            symbol?: string /* ''  Instrument symbol. Send a bare series (e.g. XBU) to get data for the nearest expiring contract in that series.

You can also send a timeframe, e.g. `XBU:monthly`. Timeframes are `daily`, `weekly`, `monthly`, `quarterly`, and `biquarterly`.*/
            filter?: string /* 'JSON'  Generic table filter. Send JSON key/value pairs, such as `{"key": "value"}`. You can key on individual fields, and do more advanced querying on timestamps. See the [Timestamp Docs](https://www.bitmex.com/app/restAPI#Timestamp-Filters) for more details.*/
            columns?: string /* 'JSON'  Array of column names to fetch. If omitted, will return all columns.

Note that this method will always return item keys, even when not specified, so you may receive more columns that you expect.*/
            count?: number /* 'int32'  Number of results to fetch.*/
            start?: number /* 'int32'  Starting point for results.*/
            reverse?: boolean /* ''  If true, will sort results newest first.*/
            startTime?: string /* 'date-time'  Starting date filter for results.*/
            endTime?: string /* 'date-time'  Ending date filter for results.*/
        }) => f<BitMEXMessage.Instrument[]>({ cookie, method: 'GET', path: '/api/v1/instrument', req }),

        getActive: (cookie: string, req: {}) => f<BitMEXMessage.Instrument[]>({ cookie, method: 'GET', path: '/api/v1/instrument/active', req }),

        getIndices: (cookie: string, req: {}) => f<BitMEXMessage.Instrument[]>({ cookie, method: 'GET', path: '/api/v1/instrument/indices', req }),

        getActiveAndIndices: (cookie: string, req: {}) => f<BitMEXMessage.Instrument[]>({ cookie, method: 'GET', path: '/api/v1/instrument/activeAndIndices', req }),

        getActiveIntervals: (cookie: string, req: {}) => f<BitMEXMessage.InstrumentInterval>({ cookie, method: 'GET', path: '/api/v1/instrument/activeIntervals', req }),

        getCompositeIndex: (cookie: string, req: {
            symbol?: string /* ''  The composite index symbol.*/
            filter?: string /* 'JSON'  Generic table filter. Send JSON key/value pairs, such as `{"key": "value"}`. You can key on individual fields, and do more advanced querying on timestamps. See the [Timestamp Docs](https://www.bitmex.com/app/restAPI#Timestamp-Filters) for more details.*/
            columns?: string /* 'JSON'  Array of column names to fetch. If omitted, will return all columns.

Note that this method will always return item keys, even when not specified, so you may receive more columns that you expect.*/
            count?: number /* 'int32'  Number of results to fetch.*/
            start?: number /* 'int32'  Starting point for results.*/
            reverse?: boolean /* ''  If true, will sort results newest first.*/
            startTime?: string /* 'date-time'  Starting date filter for results.*/
            endTime?: string /* 'date-time'  Ending date filter for results.*/
        }) => f<BitMEXMessage.IndexComposite[]>({ cookie, method: 'GET', path: '/api/v1/instrument/compositeIndex', req })
    },

    Insurance: {

        get: (cookie: string, req: {
            symbol?: string /* ''  Instrument symbol. Send a bare series (e.g. XBU) to get data for the nearest expiring contract in that series.

You can also send a timeframe, e.g. `XBU:monthly`. Timeframes are `daily`, `weekly`, `monthly`, `quarterly`, and `biquarterly`.*/
            filter?: string /* 'JSON'  Generic table filter. Send JSON key/value pairs, such as `{"key": "value"}`. You can key on individual fields, and do more advanced querying on timestamps. See the [Timestamp Docs](https://www.bitmex.com/app/restAPI#Timestamp-Filters) for more details.*/
            columns?: string /* 'JSON'  Array of column names to fetch. If omitted, will return all columns.

Note that this method will always return item keys, even when not specified, so you may receive more columns that you expect.*/
            count?: number /* 'int32'  Number of results to fetch.*/
            start?: number /* 'int32'  Starting point for results.*/
            reverse?: boolean /* ''  If true, will sort results newest first.*/
            startTime?: string /* 'date-time'  Starting date filter for results.*/
            endTime?: string /* 'date-time'  Ending date filter for results.*/
        }) => f<BitMEXMessage.Insurance[]>({ cookie, method: 'GET', path: '/api/v1/insurance', req })
    },

    Leaderboard: {

        get: (cookie: string, req: {
            method?: string /* ''  Ranking type. Options: "notional", "ROE"*/
        }) => f<BitMEXMessage.Leaderboard[]>({ cookie, method: 'GET', path: '/api/v1/leaderboard', req }),

        getName: (cookie: string, req: {}) => f<{ name: string }>({ cookie, method: 'GET', path: '/api/v1/leaderboard/name', req })
    },

    Liquidation: {

        get: (cookie: string, req: {
            symbol?: string /* ''  Instrument symbol. Send a bare series (e.g. XBU) to get data for the nearest expiring contract in that series.

You can also send a timeframe, e.g. `XBU:monthly`. Timeframes are `daily`, `weekly`, `monthly`, `quarterly`, and `biquarterly`.*/
            filter?: string /* 'JSON'  Generic table filter. Send JSON key/value pairs, such as `{"key": "value"}`. You can key on individual fields, and do more advanced querying on timestamps. See the [Timestamp Docs](https://www.bitmex.com/app/restAPI#Timestamp-Filters) for more details.*/
            columns?: string /* 'JSON'  Array of column names to fetch. If omitted, will return all columns.

Note that this method will always return item keys, even when not specified, so you may receive more columns that you expect.*/
            count?: number /* 'int32'  Number of results to fetch.*/
            start?: number /* 'int32'  Starting point for results.*/
            reverse?: boolean /* ''  If true, will sort results newest first.*/
            startTime?: string /* 'date-time'  Starting date filter for results.*/
            endTime?: string /* 'date-time'  Ending date filter for results.*/
        }) => f<BitMEXMessage.Liquidation[]>({ cookie, method: 'GET', path: '/api/v1/liquidation', req })
    },

    GlobalNotification: {

        get: (cookie: string, req: {}) => f<BitMEXMessage.GlobalNotification[]>({ cookie, method: 'GET', path: '/api/v1/globalNotification', req })
    },

    Order: {

        getOrders: (cookie: string, req: {
            symbol?: string /* ''  Instrument symbol. Send a bare series (e.g. XBU) to get data for the nearest expiring contract in that series.

You can also send a timeframe, e.g. `XBU:monthly`. Timeframes are `daily`, `weekly`, `monthly`, `quarterly`, and `biquarterly`.*/
            filter?: string /* 'JSON'  Generic table filter. Send JSON key/value pairs, such as `{"key": "value"}`. You can key on individual fields, and do more advanced querying on timestamps. See the [Timestamp Docs](https://www.bitmex.com/app/restAPI#Timestamp-Filters) for more details.*/
            columns?: string /* 'JSON'  Array of column names to fetch. If omitted, will return all columns.

Note that this method will always return item keys, even when not specified, so you may receive more columns that you expect.*/
            count?: number /* 'int32'  Number of results to fetch.*/
            start?: number /* 'int32'  Starting point for results.*/
            reverse?: boolean /* ''  If true, will sort results newest first.*/
            startTime?: string /* 'date-time'  Starting date filter for results.*/
            endTime?: string /* 'date-time'  Ending date filter for results.*/
        }) => f<BitMEXMessage.Order[]>({ cookie, method: 'GET', path: '/api/v1/order', req }),

        new: (cookie: string, req: {
            symbol: string /* ''  Instrument symbol. e.g. 'XBTUSD'.*/
            side?: string /* ''  Order side. Valid options: Buy, Sell. Defaults to 'Buy' unless `orderQty` is negative.*/
            simpleOrderQty?: number /* 'double'  Deprecated: simple orders are not supported after 2018/10/26*/
            orderQty?: number /* 'int32'  Order quantity in units of the instrument (i.e. contracts).*/
            price?: number /* 'double'  Optional limit price for 'Limit', 'StopLimit', and 'LimitIfTouched' orders.*/
            displayQty?: number /* 'int32'  Optional quantity to display in the book. Use 0 for a fully hidden order.*/
            stopPx?: number /* 'double'  Optional trigger price for 'Stop', 'StopLimit', 'MarketIfTouched', and 'LimitIfTouched' orders. Use a price below the current price for stop-sell orders and buy-if-touched orders. Use `execInst` of 'MarkPrice' or 'LastPrice' to define the current price used for triggering.*/
            clOrdID?: string /* ''  Optional Client Order ID. This clOrdID will come back on the order and any related executions.*/
            clOrdLinkID?: string /* ''  Deprecated: linked orders are not supported after 2018/11/10.*/
            pegOffsetValue?: number /* 'double'  Optional trailing offset from the current price for 'Stop', 'StopLimit', 'MarketIfTouched', and 'LimitIfTouched' orders; use a negative offset for stop-sell orders and buy-if-touched orders. Optional offset from the peg price for 'Pegged' orders.*/
            pegPriceType?: string /* ''  Optional peg price type. Valid options: LastPeg, MidPricePeg, MarketPeg, PrimaryPeg, TrailingStopPeg.*/
            ordType?: string /* ''  Order type. Valid options: Market, Limit, Stop, StopLimit, MarketIfTouched, LimitIfTouched, Pegged. Defaults to 'Limit' when `price` is specified. Defaults to 'Stop' when `stopPx` is specified. Defaults to 'StopLimit' when `price` and `stopPx` are specified.*/
            timeInForce?: string /* ''  Time in force. Valid options: Day, GoodTillCancel, ImmediateOrCancel, FillOrKill. Defaults to 'GoodTillCancel' for 'Limit', 'StopLimit', and 'LimitIfTouched' orders.*/
            execInst?: string /* ''  Optional execution instructions. Valid options: ParticipateDoNotInitiate, AllOrNone, MarkPrice, IndexPrice, LastPrice, Close, ReduceOnly, Fixed. 'AllOrNone' instruction requires `displayQty` to be 0. 'MarkPrice', 'IndexPrice' or 'LastPrice' instruction valid for 'Stop', 'StopLimit', 'MarketIfTouched', and 'LimitIfTouched' orders.*/
            contingencyType?: string /* ''  Deprecated: linked orders are not supported after 2018/11/10.*/
            text?: string /* ''  Optional order annotation. e.g. 'Take profit'.*/
        }) => f<BitMEXMessage.Order>({ cookie, method: 'POST', path: '/api/v1/order', req }),

        amend: (cookie: string, req: {
            orderID?: string /* ''  Order ID*/
            origClOrdID?: string /* ''  Client Order ID. See POST /order.*/
            clOrdID?: string /* ''  Optional new Client Order ID, requires `origClOrdID`.*/
            simpleOrderQty?: number /* 'double'  Deprecated: simple orders are not supported after 2018/10/26*/
            orderQty?: number /* 'int32'  Optional order quantity in units of the instrument (i.e. contracts).*/
            simpleLeavesQty?: number /* 'double'  Deprecated: simple orders are not supported after 2018/10/26*/
            leavesQty?: number /* 'int32'  Optional leaves quantity in units of the instrument (i.e. contracts). Useful for amending partially filled orders.*/
            price?: number /* 'double'  Optional limit price for 'Limit', 'StopLimit', and 'LimitIfTouched' orders.*/
            stopPx?: number /* 'double'  Optional trigger price for 'Stop', 'StopLimit', 'MarketIfTouched', and 'LimitIfTouched' orders. Use a price below the current price for stop-sell orders and buy-if-touched orders.*/
            pegOffsetValue?: number /* 'double'  Optional trailing offset from the current price for 'Stop', 'StopLimit', 'MarketIfTouched', and 'LimitIfTouched' orders; use a negative offset for stop-sell orders and buy-if-touched orders. Optional offset from the peg price for 'Pegged' orders.*/
            text?: string /* ''  Optional amend annotation. e.g. 'Adjust skew'.*/
        }) => f<BitMEXMessage.Order>({ cookie, method: 'PUT', path: '/api/v1/order', req }),

        cancel: (cookie: string, req: {
            orderID?: string /* 'JSON'  Order ID(s).*/
            clOrdID?: string /* 'JSON'  Client Order ID(s). See POST /order.*/
            text?: string /* ''  Optional cancellation annotation. e.g. 'Spread Exceeded'.*/
        }) => f<BitMEXMessage.Order[]>({ cookie, method: 'DELETE', path: '/api/v1/order', req }),

        newBulk: (cookie: string, req: {
            orders?: string /* 'JSON'  An array of orders.*/
        }) => f<BitMEXMessage.Order[]>({ cookie, method: 'POST', path: '/api/v1/order/bulk', req }),

        amendBulk: (cookie: string, req: {
            orders?: string /* 'JSON'  An array of orders.*/
        }) => f<BitMEXMessage.Order[]>({ cookie, method: 'PUT', path: '/api/v1/order/bulk', req }),

        closePosition: (cookie: string, req: {
            symbol: string /* ''  Symbol of position to close.*/
            price?: number /* 'double'  Optional limit price.*/
        }) => f<BitMEXMessage.Order /* description:Resulting close order.*/>({ cookie, method: 'POST', path: '/api/v1/order/closePosition', req }),

        cancelAll: (cookie: string, req: {
            symbol?: string /* ''  Optional symbol. If provided, only cancels orders for that symbol.*/
            filter?: string /* 'JSON'  Optional filter for cancellation. Use to only cancel some orders, e.g. `{"side": "Buy"}`.*/
            text?: string /* ''  Optional cancellation annotation. e.g. 'Spread Exceeded'*/
        }) => f<BitMEXMessage.Order[]>({ cookie, method: 'DELETE', path: '/api/v1/order/all', req }),

        cancelAllAfter: (cookie: string, req: {
            timeout: number /* 'double'  Timeout in ms. Set to 0 to cancel this timer. */
        }) => f<{}>({ cookie, method: 'POST', path: '/api/v1/order/cancelAllAfter', req })
    },

    OrderBook: {

        getL2: (cookie: string, req: {
            symbol: string /* ''  Instrument symbol. Send a series (e.g. XBT) to get data for the nearest contract in that series.*/
            depth?: number /* 'int32'  Orderbook depth per side. Send 0 for full depth.*/
        }) => f<BitMEXMessage.OrderBookL2[]>({ cookie, method: 'GET', path: '/api/v1/orderBook/L2', req })
    },

    Position: {

        get: (cookie: string, req: {
            filter?: string /* 'JSON'  Table filter. For example, send {"symbol": "XBTUSD"}.*/
            columns?: string /* 'JSON'  Which columns to fetch. For example, send ["columnName"].*/
            count?: number /* 'int32'  Number of rows to fetch.*/
        }) => f<BitMEXMessage.Position[]>({ cookie, method: 'GET', path: '/api/v1/position', req }),

        isolateMargin: (cookie: string, req: {
            symbol: string /* ''  Position symbol to isolate.*/
            enabled?: boolean /* ''  True for isolated margin, false for cross margin.*/
        }) => f<BitMEXMessage.Position /* description:Affected position.*/>({ cookie, method: 'POST', path: '/api/v1/position/isolate', req }),

        updateRiskLimit: (cookie: string, req: {
            symbol: string /* ''  Symbol of position to update risk limit on.*/
            riskLimit: number /* 'int64'  New Risk Limit, in Satoshis.*/
        }) => f<BitMEXMessage.Position /* description:Affected position.*/>({ cookie, method: 'POST', path: '/api/v1/position/riskLimit', req }),

        transferIsolatedMargin: (cookie: string, req: {
            symbol: string /* ''  Symbol of position to isolate.*/
            amount: number /* 'int64'  Amount to transfer, in Satoshis. May be negative.*/
        }) => f<BitMEXMessage.Position /* description:Affected position.*/>({ cookie, method: 'POST', path: '/api/v1/position/transferMargin', req }),

        updateLeverage: (cookie: string, req: {
            symbol: string /* ''  Symbol of position to adjust.*/
            leverage: number /* 'double'  Leverage value. Send a number between 0.01 and 100 to enable isolated margin with a fixed leverage. Send 0 to enable cross margin.*/
        }) => f<BitMEXMessage.Position /* description:Affected position.*/>({ cookie, method: 'POST', path: '/api/v1/position/leverage', req })
    },

    Quote: {

        get: (cookie: string, req: {
            symbol?: string /* ''  Instrument symbol. Send a bare series (e.g. XBU) to get data for the nearest expiring contract in that series.

You can also send a timeframe, e.g. `XBU:monthly`. Timeframes are `daily`, `weekly`, `monthly`, `quarterly`, and `biquarterly`.*/
            filter?: string /* 'JSON'  Generic table filter. Send JSON key/value pairs, such as `{"key": "value"}`. You can key on individual fields, and do more advanced querying on timestamps. See the [Timestamp Docs](https://www.bitmex.com/app/restAPI#Timestamp-Filters) for more details.*/
            columns?: string /* 'JSON'  Array of column names to fetch. If omitted, will return all columns.

Note that this method will always return item keys, even when not specified, so you may receive more columns that you expect.*/
            count?: number /* 'int32'  Number of results to fetch.*/
            start?: number /* 'int32'  Starting point for results.*/
            reverse?: boolean /* ''  If true, will sort results newest first.*/
            startTime?: string /* 'date-time'  Starting date filter for results.*/
            endTime?: string /* 'date-time'  Ending date filter for results.*/
        }) => f<BitMEXMessage.Quote[]>({ cookie, method: 'GET', path: '/api/v1/quote', req }),

        getBucketed: (cookie: string, req: {
            binSize?: string /* ''  Time interval to bucket by. Available options: [1m,5m,1h,1d].*/
            partial?: boolean /* ''  If true, will send in-progress (incomplete) bins for the current time period.*/
            symbol?: string /* ''  Instrument symbol. Send a bare series (e.g. XBU) to get data for the nearest expiring contract in that series.

You can also send a timeframe, e.g. `XBU:monthly`. Timeframes are `daily`, `weekly`, `monthly`, `quarterly`, and `biquarterly`.*/
            filter?: string /* 'JSON'  Generic table filter. Send JSON key/value pairs, such as `{"key": "value"}`. You can key on individual fields, and do more advanced querying on timestamps. See the [Timestamp Docs](https://www.bitmex.com/app/restAPI#Timestamp-Filters) for more details.*/
            columns?: string /* 'JSON'  Array of column names to fetch. If omitted, will return all columns.

Note that this method will always return item keys, even when not specified, so you may receive more columns that you expect.*/
            count?: number /* 'int32'  Number of results to fetch.*/
            start?: number /* 'int32'  Starting point for results.*/
            reverse?: boolean /* ''  If true, will sort results newest first.*/
            startTime?: string /* 'date-time'  Starting date filter for results.*/
            endTime?: string /* 'date-time'  Ending date filter for results.*/
        }) => f<BitMEXMessage.Quote[]>({ cookie, method: 'GET', path: '/api/v1/quote/bucketed', req })
    },

    Schema: {

        get: (cookie: string, req: {
            model?: string /* ''  Optional model filter. If omitted, will return all models.*/
        }) => f<{}>({ cookie, method: 'GET', path: '/api/v1/schema', req }),

        websocketHelp: (cookie: string, req: {}) => f<{}>({ cookie, method: 'GET', path: '/api/v1/schema/websocketHelp', req })
    },

    Settlement: {

        get: (cookie: string, req: {
            symbol?: string /* ''  Instrument symbol. Send a bare series (e.g. XBU) to get data for the nearest expiring contract in that series.

You can also send a timeframe, e.g. `XBU:monthly`. Timeframes are `daily`, `weekly`, `monthly`, `quarterly`, and `biquarterly`.*/
            filter?: string /* 'JSON'  Generic table filter. Send JSON key/value pairs, such as `{"key": "value"}`. You can key on individual fields, and do more advanced querying on timestamps. See the [Timestamp Docs](https://www.bitmex.com/app/restAPI#Timestamp-Filters) for more details.*/
            columns?: string /* 'JSON'  Array of column names to fetch. If omitted, will return all columns.

Note that this method will always return item keys, even when not specified, so you may receive more columns that you expect.*/
            count?: number /* 'int32'  Number of results to fetch.*/
            start?: number /* 'int32'  Starting point for results.*/
            reverse?: boolean /* ''  If true, will sort results newest first.*/
            startTime?: string /* 'date-time'  Starting date filter for results.*/
            endTime?: string /* 'date-time'  Ending date filter for results.*/
        }) => f<BitMEXMessage.Settlement[]>({ cookie, method: 'GET', path: '/api/v1/settlement', req })
    },

    Stats: {

        get: (cookie: string, req: {}) => f<BitMEXMessage.Stats[]>({ cookie, method: 'GET', path: '/api/v1/stats', req }),

        history: (cookie: string, req: {}) => f<BitMEXMessage.StatsHistory[]>({ cookie, method: 'GET', path: '/api/v1/stats/history', req }),

        historyUSD: (cookie: string, req: {}) => f<BitMEXMessage.StatsUSD[]>({ cookie, method: 'GET', path: '/api/v1/stats/historyUSD', req })
    },

    Trade: {

        get: (cookie: string, req: {
            symbol?: string /* ''  Instrument symbol. Send a bare series (e.g. XBU) to get data for the nearest expiring contract in that series.

You can also send a timeframe, e.g. `XBU:monthly`. Timeframes are `daily`, `weekly`, `monthly`, `quarterly`, and `biquarterly`.*/
            filter?: string /* 'JSON'  Generic table filter. Send JSON key/value pairs, such as `{"key": "value"}`. You can key on individual fields, and do more advanced querying on timestamps. See the [Timestamp Docs](https://www.bitmex.com/app/restAPI#Timestamp-Filters) for more details.*/
            columns?: string /* 'JSON'  Array of column names to fetch. If omitted, will return all columns.

Note that this method will always return item keys, even when not specified, so you may receive more columns that you expect.*/
            count?: number /* 'int32'  Number of results to fetch.*/
            start?: number /* 'int32'  Starting point for results.*/
            reverse?: boolean /* ''  If true, will sort results newest first.*/
            startTime?: string /* 'date-time'  Starting date filter for results.*/
            endTime?: string /* 'date-time'  Ending date filter for results.*/
        }) => f<BitMEXMessage.Trade[]>({ cookie, method: 'GET', path: '/api/v1/trade', req }),

        getBucketed: (cookie: string, req: {
            binSize?: string /* ''  Time interval to bucket by. Available options: [1m,5m,1h,1d].*/
            partial?: boolean /* ''  If true, will send in-progress (incomplete) bins for the current time period.*/
            symbol?: string /* ''  Instrument symbol. Send a bare series (e.g. XBU) to get data for the nearest expiring contract in that series.

You can also send a timeframe, e.g. `XBU:monthly`. Timeframes are `daily`, `weekly`, `monthly`, `quarterly`, and `biquarterly`.*/
            filter?: string /* 'JSON'  Generic table filter. Send JSON key/value pairs, such as `{"key": "value"}`. You can key on individual fields, and do more advanced querying on timestamps. See the [Timestamp Docs](https://www.bitmex.com/app/restAPI#Timestamp-Filters) for more details.*/
            columns?: string /* 'JSON'  Array of column names to fetch. If omitted, will return all columns.

Note that this method will always return item keys, even when not specified, so you may receive more columns that you expect.*/
            count?: number /* 'int32'  Number of results to fetch.*/
            start?: number /* 'int32'  Starting point for results.*/
            reverse?: boolean /* ''  If true, will sort results newest first.*/
            startTime?: string /* 'date-time'  Starting date filter for results.*/
            endTime?: string /* 'date-time'  Ending date filter for results.*/
        }) => f<BitMEXMessage.TradeBin[]>({ cookie, method: 'GET', path: '/api/v1/trade/bucketed', req })
    },

    User: {

        getDepositAddress: (cookie: string, req: {
            currency?: string /* ''  */
        }) => f<string>({ cookie, method: 'GET', path: '/api/v1/user/depositAddress', req }),

        getWallet: (cookie: string, req: {
            currency?: string /* ''  */
        }) => f<BitMEXMessage.Wallet>({ cookie, method: 'GET', path: '/api/v1/user/wallet', req }),

        getWalletHistory: (cookie: string, req: {
            currency?: string /* ''  */
            count?: number /* 'double'  Number of results to fetch.*/
            start?: number /* 'double'  Starting point for results.*/
        }) => f<BitMEXMessage.Transaction[]>({ cookie, method: 'GET', path: '/api/v1/user/walletHistory', req }),

        getWalletSummary: (cookie: string, req: {
            currency?: string /* ''  */
        }) => f<BitMEXMessage.Transaction[]>({ cookie, method: 'GET', path: '/api/v1/user/walletSummary', req }),

        getExecutionHistory: (cookie: string, req: {
            symbol: string /* ''  */
            timestamp: string /* 'date-time'  */
        }) => f<{}>({ cookie, method: 'GET', path: '/api/v1/user/executionHistory', req }),

        minWithdrawalFee: (cookie: string, req: {
            currency?: string /* ''  */
        }) => f<{}>({ cookie, method: 'GET', path: '/api/v1/user/minWithdrawalFee', req }),

        requestWithdrawal: (cookie: string, req: {
            otpToken?: string /* ''  2FA token. Required if 2FA is enabled on your account.*/
            currency: string /* ''  Currency you're withdrawing. Options: `XBt`*/
            amount: number /* 'int64'  Amount of withdrawal currency.*/
            address: string /* ''  Destination Address.*/
            fee?: number /* 'double'  Network fee for Bitcoin withdrawals. If not specified, a default value will be calculated based on Bitcoin network conditions. You will have a chance to confirm this via email.*/
            text?: string /* ''  Optional annotation, e.g. 'Transfer to home wallet'.*/
        }) => f<BitMEXMessage.Transaction>({ cookie, method: 'POST', path: '/api/v1/user/requestWithdrawal', req }),

        cancelWithdrawal: (cookie: string, req: {
            token: string /* ''  */
        }) => f<BitMEXMessage.Transaction>({ cookie, method: 'POST', path: '/api/v1/user/cancelWithdrawal', req }),

        confirmWithdrawal: (cookie: string, req: {
            token: string /* ''  */
        }) => f<BitMEXMessage.Transaction>({ cookie, method: 'POST', path: '/api/v1/user/confirmWithdrawal', req }),

        confirm: (cookie: string, req: {
            token: string /* ''  */
        }) => f<BitMEXMessage.AccessToken>({ cookie, method: 'POST', path: '/api/v1/user/confirmEmail', req }),

        getAffiliateStatus: (cookie: string, req: {}) => f<BitMEXMessage.Affiliate>({ cookie, method: 'GET', path: '/api/v1/user/affiliateStatus', req }),

        checkReferralCode: (cookie: string, req: {
            referralCode?: string /* ''  */
        }) => f<number /* format:double*/>({ cookie, method: 'GET', path: '/api/v1/user/checkReferralCode', req }),

        logout: (cookie: string, req: {}) => f<null>({ cookie, method: 'POST', path: '/api/v1/user/logout', req }),

        savePreferences: (cookie: string, req: {
            prefs: string /* 'JSON'  */
            overwrite?: boolean /* ''  If true, will overwrite all existing preferences.*/
        }) => f<BitMEXMessage.User>({ cookie, method: 'POST', path: '/api/v1/user/preferences', req }),

        get: (cookie: string, req: {}) => f<BitMEXMessage.User>({ cookie, method: 'GET', path: '/api/v1/user', req }),

        getCommission: (cookie: string, req: {}) => f<BitMEXMessage.UserCommissionsBySymbol>({ cookie, method: 'GET', path: '/api/v1/user/commission', req }),

        getMargin: (cookie: string, req: {
            currency?: string /* ''  */
        }) => f<BitMEXMessage.Margin>({ cookie, method: 'GET', path: '/api/v1/user/margin', req }),

        communicationToken: (cookie: string, req: {
            token: string /* ''  */
            platformAgent: string /* ''  */
        }) => f<BitMEXMessage.CommunicationToken[]>({ cookie, method: 'POST', path: '/api/v1/user/communicationToken', req })
    },

    UserEvent: {

        get: (cookie: string, req: {
            count?: number /* 'double'  Number of results to fetch.*/
            startId?: number /* 'double'  Cursor for pagination.*/
        }) => f<BitMEXMessage.UserEvent[]>({ cookie, method: 'GET', path: '/api/v1/userEvent', req })
    }
}