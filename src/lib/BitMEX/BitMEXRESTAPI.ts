
//greate by https://www.bitmex.com/api/explorer/swagger.json

import { BitMEXMessage } from './BitMEXMessage'
import { BitMEXRESTAPI__http } from './BitMEXRESTAPI__http'

export const BitMEXRESTAPI = {

    Announcement: {

        get: (cookie: string, req: {
            columns?: string /* 'JSON'  Array of column names to fetch. If omitted, will return all columns.*/
        }) => BitMEXRESTAPI__http<BitMEXMessage.Announcement[]>({ cookie, method: 'GET', path: '/api/v1/announcement', req }),

        getUrgent: (cookie: string, req: {}) => BitMEXRESTAPI__http<BitMEXMessage.Announcement[]>({ cookie, method: 'GET', path: '/api/v1/announcement/urgent', req })
    },

    APIKey: {

        new: (cookie: string, req: {
            name?: string /* ''  Key name. This name is for reference only.*/
            cidr?: string /* ''  CIDR block to restrict this key to. To restrict to a single address, append "/32", e.g. 207.39.29.22/32. Leave blank or set to 0.0.0.0/0 to allow all IPs. Only one block may be set. <a href="http://software77.net/cidr-101.html">More on CIDR blocks</a>*/
            permissions?: string /* 'JSON'  Key Permissions. All keys can read margin and position data. Additional permissions must be added. Available: ["order", "orderCancel", "withdraw"].*/
            enabled?: boolean /* ''  Set to true to enable this key on creation. Otherwise, it must be explicitly enabled via /apiKey/enable.*/
            token?: string /* ''  OTP Token (YubiKey, Google Authenticator)*/
        }) => BitMEXRESTAPI__http<BitMEXMessage.APIKey>({ cookie, method: 'POST', path: '/api/v1/apiKey', req }),

        get: (cookie: string, req: {
            reverse?: boolean /* ''  If true, will sort results newest first.*/
        }) => BitMEXRESTAPI__http<BitMEXMessage.APIKey[]>({ cookie, method: 'GET', path: '/api/v1/apiKey', req }),

        remove: (cookie: string, req: {
            apiKeyID: string /* ''  API Key ID (public component).*/
        }) => BitMEXRESTAPI__http<{ success: boolean }>({ cookie, method: 'DELETE', path: '/api/v1/apiKey', req }),

        disable: (cookie: string, req: {
            apiKeyID: string /* ''  API Key ID (public component).*/
        }) => BitMEXRESTAPI__http<BitMEXMessage.APIKey>({ cookie, method: 'POST', path: '/api/v1/apiKey/disable', req }),

        enable: (cookie: string, req: {
            apiKeyID: string /* ''  API Key ID (public component).*/
        }) => BitMEXRESTAPI__http<BitMEXMessage.APIKey>({ cookie, method: 'POST', path: '/api/v1/apiKey/enable', req })
    },

    Chat: {

        get: (cookie: string, req: {
            count?: number /* 'int32'  Number of results to fetch.*/
            start?: number /* 'int32'  Starting ID for results.*/
            reverse?: boolean /* ''  If true, will sort results newest first.*/
            channelID?: number /* 'double'  Channel id. GET /chat/channels for ids. Leave blank for all.*/
        }) => BitMEXRESTAPI__http<BitMEXMessage.Chat[]>({ cookie, method: 'GET', path: '/api/v1/chat', req }),

        new: (cookie: string, req: {
            message: string /* ''  */
            channelID?: number /* 'double'  Channel to post to. Default 1 (English).*/
        }) => BitMEXRESTAPI__http<BitMEXMessage.Chat>({ cookie, method: 'POST', path: '/api/v1/chat', req }),

        getChannels: (cookie: string, req: {}) => BitMEXRESTAPI__http<BitMEXMessage.ChatChannel[]>({ cookie, method: 'GET', path: '/api/v1/chat/channels', req }),

        getConnected: (cookie: string, req: {}) => BitMEXRESTAPI__http<BitMEXMessage.ConnectedUsers>({ cookie, method: 'GET', path: '/api/v1/chat/connected', req })
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
        }) => BitMEXRESTAPI__http<BitMEXMessage.Execution[]>({ cookie, method: 'GET', path: '/api/v1/execution', req }),

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
        }) => BitMEXRESTAPI__http<BitMEXMessage.Execution[]>({ cookie, method: 'GET', path: '/api/v1/execution/tradeHistory', req })
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
        }) => BitMEXRESTAPI__http<BitMEXMessage.Funding[]>({ cookie, method: 'GET', path: '/api/v1/funding', req })
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
        }) => BitMEXRESTAPI__http<BitMEXMessage.Instrument[]>({ cookie, method: 'GET', path: '/api/v1/instrument', req }),

        getActive: (cookie: string, req: {}) => BitMEXRESTAPI__http<BitMEXMessage.Instrument[]>({ cookie, method: 'GET', path: '/api/v1/instrument/active', req }),

        getIndices: (cookie: string, req: {}) => BitMEXRESTAPI__http<BitMEXMessage.Instrument[]>({ cookie, method: 'GET', path: '/api/v1/instrument/indices', req }),

        getActiveAndIndices: (cookie: string, req: {}) => BitMEXRESTAPI__http<BitMEXMessage.Instrument[]>({ cookie, method: 'GET', path: '/api/v1/instrument/activeAndIndices', req }),

        getActiveIntervals: (cookie: string, req: {}) => BitMEXRESTAPI__http<BitMEXMessage.InstrumentInterval>({ cookie, method: 'GET', path: '/api/v1/instrument/activeIntervals', req }),

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
        }) => BitMEXRESTAPI__http<BitMEXMessage.IndexComposite[]>({ cookie, method: 'GET', path: '/api/v1/instrument/compositeIndex', req })
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
        }) => BitMEXRESTAPI__http<BitMEXMessage.Insurance[]>({ cookie, method: 'GET', path: '/api/v1/insurance', req })
    },

    Leaderboard: {

        get: (cookie: string, req: {
            method?: string /* ''  Ranking type. Options: "notional", "ROE"*/
        }) => BitMEXRESTAPI__http<BitMEXMessage.Leaderboard[]>({ cookie, method: 'GET', path: '/api/v1/leaderboard', req }),

        getName: (cookie: string, req: {}) => BitMEXRESTAPI__http<{ name: string }>({ cookie, method: 'GET', path: '/api/v1/leaderboard/name', req })
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
        }) => BitMEXRESTAPI__http<BitMEXMessage.Liquidation[]>({ cookie, method: 'GET', path: '/api/v1/liquidation', req })
    },

    GlobalNotification: {

        get: (cookie: string, req: {}) => BitMEXRESTAPI__http<BitMEXMessage.GlobalNotification[]>({ cookie, method: 'GET', path: '/api/v1/globalNotification', req })
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
        }) => BitMEXRESTAPI__http<BitMEXMessage.Order[]>({ cookie, method: 'GET', path: '/api/v1/order', req }),

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
            ordType?: string /* ''  Order type. Valid options: Market, Limit, Stop, StopLimit, MarketIfTouched, LimitIfTouched, MarketWithLeftOverAsLimit, Pegged. Defaults to 'Limit' when `price` is specified. Defaults to 'Stop' when `stopPx` is specified. Defaults to 'StopLimit' when `price` and `stopPx` are specified.*/
            timeInForce?: string /* ''  Time in force. Valid options: Day, GoodTillCancel, ImmediateOrCancel, FillOrKill. Defaults to 'GoodTillCancel' for 'Limit', 'StopLimit', 'LimitIfTouched', and 'MarketWithLeftOverAsLimit' orders.*/
            execInst?: string /* ''  Optional execution instructions. Valid options: ParticipateDoNotInitiate, AllOrNone, MarkPrice, IndexPrice, LastPrice, Close, ReduceOnly, Fixed. 'AllOrNone' instruction requires `displayQty` to be 0. 'MarkPrice', 'IndexPrice' or 'LastPrice' instruction valid for 'Stop', 'StopLimit', 'MarketIfTouched', and 'LimitIfTouched' orders.*/
            contingencyType?: string /* ''  Deprecated: linked orders are not supported after 2018/11/10.*/
            text?: string /* ''  Optional order annotation. e.g. 'Take profit'.*/
        }) => BitMEXRESTAPI__http<BitMEXMessage.Order>({ cookie, method: 'POST', path: '/api/v1/order', req }),

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
        }) => BitMEXRESTAPI__http<BitMEXMessage.Order>({ cookie, method: 'PUT', path: '/api/v1/order', req }),

        cancel: (cookie: string, req: {
            orderID?: string /* 'JSON'  Order ID(s).*/
            clOrdID?: string /* 'JSON'  Client Order ID(s). See POST /order.*/
            text?: string /* ''  Optional cancellation annotation. e.g. 'Spread Exceeded'.*/
        }) => BitMEXRESTAPI__http<BitMEXMessage.Order[]>({ cookie, method: 'DELETE', path: '/api/v1/order', req }),

        newBulk: (cookie: string, req: {
            orders?: string /* 'JSON'  An array of orders.*/
        }) => BitMEXRESTAPI__http<BitMEXMessage.Order[]>({ cookie, method: 'POST', path: '/api/v1/order/bulk', req }),

        amendBulk: (cookie: string, req: {
            orders?: string /* 'JSON'  An array of orders.*/
        }) => BitMEXRESTAPI__http<BitMEXMessage.Order[]>({ cookie, method: 'PUT', path: '/api/v1/order/bulk', req }),

        closePosition: (cookie: string, req: {
            symbol: string /* ''  Symbol of position to close.*/
            price?: number /* 'double'  Optional limit price.*/
        }) => BitMEXRESTAPI__http<BitMEXMessage.Order /* description:Resulting close order.*/>({ cookie, method: 'POST', path: '/api/v1/order/closePosition', req }),

        cancelAll: (cookie: string, req: {
            symbol?: string /* ''  Optional symbol. If provided, only cancels orders for that symbol.*/
            filter?: string /* 'JSON'  Optional filter for cancellation. Use to only cancel some orders, e.g. `{"side": "Buy"}`.*/
            text?: string /* ''  Optional cancellation annotation. e.g. 'Spread Exceeded'*/
        }) => BitMEXRESTAPI__http<BitMEXMessage.Order[]>({ cookie, method: 'DELETE', path: '/api/v1/order/all', req }),

        cancelAllAfter: (cookie: string, req: {
            timeout: number /* 'double'  Timeout in ms. Set to 0 to cancel this timer. */
        }) => BitMEXRESTAPI__http<{}>({ cookie, method: 'POST', path: '/api/v1/order/cancelAllAfter', req })
    },

    OrderBook: {

        getL2: (cookie: string, req: {
            symbol: string /* ''  Instrument symbol. Send a series (e.g. XBT) to get data for the nearest contract in that series.*/
            depth?: number /* 'int32'  Orderbook depth per side. Send 0 for full depth.*/
        }) => BitMEXRESTAPI__http<BitMEXMessage.OrderBookL2[]>({ cookie, method: 'GET', path: '/api/v1/orderBook/L2', req })
    },

    Position: {

        get: (cookie: string, req: {
            filter?: string /* 'JSON'  Table filter. For example, send {"symbol": "XBTUSD"}.*/
            columns?: string /* 'JSON'  Which columns to fetch. For example, send ["columnName"].*/
            count?: number /* 'int32'  Number of rows to fetch.*/
        }) => BitMEXRESTAPI__http<BitMEXMessage.Position[]>({ cookie, method: 'GET', path: '/api/v1/position', req }),

        isolateMargin: (cookie: string, req: {
            symbol: string /* ''  Position symbol to isolate.*/
            enabled?: boolean /* ''  True for isolated margin, false for cross margin.*/
        }) => BitMEXRESTAPI__http<BitMEXMessage.Position /* description:Affected position.*/>({ cookie, method: 'POST', path: '/api/v1/position/isolate', req }),

        updateRiskLimit: (cookie: string, req: {
            symbol: string /* ''  Symbol of position to update risk limit on.*/
            riskLimit: number /* 'int64'  New Risk Limit, in Satoshis.*/
        }) => BitMEXRESTAPI__http<BitMEXMessage.Position /* description:Affected position.*/>({ cookie, method: 'POST', path: '/api/v1/position/riskLimit', req }),

        transferIsolatedMargin: (cookie: string, req: {
            symbol: string /* ''  Symbol of position to isolate.*/
            amount: number /* 'int64'  Amount to transfer, in Satoshis. May be negative.*/
        }) => BitMEXRESTAPI__http<BitMEXMessage.Position /* description:Affected position.*/>({ cookie, method: 'POST', path: '/api/v1/position/transferMargin', req }),

        updateLeverage: (cookie: string, req: {
            symbol: string /* ''  Symbol of position to adjust.*/
            leverage: number /* 'double'  Leverage value. Send a number between 0.01 and 100 to enable isolated margin with a fixed leverage. Send 0 to enable cross margin.*/
        }) => BitMEXRESTAPI__http<BitMEXMessage.Position /* description:Affected position.*/>({ cookie, method: 'POST', path: '/api/v1/position/leverage', req })
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
        }) => BitMEXRESTAPI__http<BitMEXMessage.Quote[]>({ cookie, method: 'GET', path: '/api/v1/quote', req }),

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
        }) => BitMEXRESTAPI__http<BitMEXMessage.Quote[]>({ cookie, method: 'GET', path: '/api/v1/quote/bucketed', req })
    },

    Schema: {

        get: (cookie: string, req: {
            model?: string /* ''  Optional model filter. If omitted, will return all models.*/
        }) => BitMEXRESTAPI__http<{}>({ cookie, method: 'GET', path: '/api/v1/schema', req }),

        websocketHelp: (cookie: string, req: {}) => BitMEXRESTAPI__http<{}>({ cookie, method: 'GET', path: '/api/v1/schema/websocketHelp', req })
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
        }) => BitMEXRESTAPI__http<BitMEXMessage.Settlement[]>({ cookie, method: 'GET', path: '/api/v1/settlement', req })
    },

    Stats: {

        get: (cookie: string, req: {}) => BitMEXRESTAPI__http<BitMEXMessage.Stats[]>({ cookie, method: 'GET', path: '/api/v1/stats', req }),

        history: (cookie: string, req: {}) => BitMEXRESTAPI__http<BitMEXMessage.StatsHistory[]>({ cookie, method: 'GET', path: '/api/v1/stats/history', req }),

        historyUSD: (cookie: string, req: {}) => BitMEXRESTAPI__http<BitMEXMessage.StatsUSD[]>({ cookie, method: 'GET', path: '/api/v1/stats/historyUSD', req })
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
        }) => BitMEXRESTAPI__http<BitMEXMessage.Trade[]>({ cookie, method: 'GET', path: '/api/v1/trade', req }),

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
        }) => BitMEXRESTAPI__http<BitMEXMessage.TradeBin[]>({ cookie, method: 'GET', path: '/api/v1/trade/bucketed', req })
    },

    User: {

        getDepositAddress: (cookie: string, req: {
            currency?: string /* ''  */
        }) => BitMEXRESTAPI__http<string>({ cookie, method: 'GET', path: '/api/v1/user/depositAddress', req }),

        getWallet: (cookie: string, req: {
            currency?: string /* ''  */
        }) => BitMEXRESTAPI__http<BitMEXMessage.Wallet>({ cookie, method: 'GET', path: '/api/v1/user/wallet', req }),

        getWalletHistory: (cookie: string, req: {
            currency?: string /* ''  */
            count?: number /* 'double'  Number of results to fetch.*/
            start?: number /* 'double'  Starting point for results.*/
        }) => BitMEXRESTAPI__http<BitMEXMessage.Transaction[]>({ cookie, method: 'GET', path: '/api/v1/user/walletHistory', req }),

        getWalletSummary: (cookie: string, req: {
            currency?: string /* ''  */
        }) => BitMEXRESTAPI__http<BitMEXMessage.Transaction[]>({ cookie, method: 'GET', path: '/api/v1/user/walletSummary', req }),

        getExecutionHistory: (cookie: string, req: {
            symbol: string /* ''  */
            timestamp: string /* 'date-time'  */
        }) => BitMEXRESTAPI__http<{}>({ cookie, method: 'GET', path: '/api/v1/user/executionHistory', req }),

        minWithdrawalFee: (cookie: string, req: {
            currency?: string /* ''  */
        }) => BitMEXRESTAPI__http<{}>({ cookie, method: 'GET', path: '/api/v1/user/minWithdrawalFee', req }),

        requestWithdrawal: (cookie: string, req: {
            otpToken?: string /* ''  2FA token. Required if 2FA is enabled on your account.*/
            currency: string /* ''  Currency you're withdrawing. Options: `XBt`*/
            amount: number /* 'int64'  Amount of withdrawal currency.*/
            address: string /* ''  Destination Address.*/
            fee?: number /* 'double'  Network fee for Bitcoin withdrawals. If not specified, a default value will be calculated based on Bitcoin network conditions. You will have a chance to confirm this via email.*/
        }) => BitMEXRESTAPI__http<BitMEXMessage.Transaction>({ cookie, method: 'POST', path: '/api/v1/user/requestWithdrawal', req }),

        cancelWithdrawal: (cookie: string, req: {
            token: string /* ''  */
        }) => BitMEXRESTAPI__http<BitMEXMessage.Transaction>({ cookie, method: 'POST', path: '/api/v1/user/cancelWithdrawal', req }),

        confirmWithdrawal: (cookie: string, req: {
            token: string /* ''  */
        }) => BitMEXRESTAPI__http<BitMEXMessage.Transaction>({ cookie, method: 'POST', path: '/api/v1/user/confirmWithdrawal', req }),

        requestEnableTFA: (cookie: string, req: {
            type?: string /* ''  Two-factor auth type. Supported types: 'GA' (Google Authenticator)*/
        }) => BitMEXRESTAPI__http<boolean>({ cookie, method: 'POST', path: '/api/v1/user/requestEnableTFA', req }),

        confirmEnableTFA: (cookie: string, req: {
            type?: string /* ''  Two-factor auth type. Supported types: 'GA' (Google Authenticator), 'Yubikey'*/
            token: string /* ''  Token from your selected TFA type.*/
        }) => BitMEXRESTAPI__http<boolean>({ cookie, method: 'POST', path: '/api/v1/user/confirmEnableTFA', req }),

        disableTFA: (cookie: string, req: {
            type?: string /* ''  Two-factor auth type. Supported types: 'GA' (Google Authenticator)*/
            token: string /* ''  Token from your selected TFA type.*/
        }) => BitMEXRESTAPI__http<boolean>({ cookie, method: 'POST', path: '/api/v1/user/disableTFA', req }),

        confirm: (cookie: string, req: {
            token: string /* ''  */
        }) => BitMEXRESTAPI__http<BitMEXMessage.AccessToken>({ cookie, method: 'POST', path: '/api/v1/user/confirmEmail', req }),

        getAffiliateStatus: (cookie: string, req: {}) => BitMEXRESTAPI__http<BitMEXMessage.Affiliate>({ cookie, method: 'GET', path: '/api/v1/user/affiliateStatus', req }),

        checkReferralCode: (cookie: string, req: {
            referralCode?: string /* ''  */
        }) => BitMEXRESTAPI__http<number /* format:double*/>({ cookie, method: 'GET', path: '/api/v1/user/checkReferralCode', req }),

        logout: (cookie: string, req: {}) => BitMEXRESTAPI__http<null>({ cookie, method: 'POST', path: '/api/v1/user/logout', req }),

        logoutAll: (cookie: string, req: {}) => BitMEXRESTAPI__http<number /* format:double*/>({ cookie, method: 'POST', path: '/api/v1/user/logoutAll', req }),

        savePreferences: (cookie: string, req: {
            prefs: string /* 'JSON'  */
            overwrite?: boolean /* ''  If true, will overwrite all existing preferences.*/
        }) => BitMEXRESTAPI__http<BitMEXMessage.User>({ cookie, method: 'POST', path: '/api/v1/user/preferences', req }),

        get: (cookie: string, req: {}) => BitMEXRESTAPI__http<BitMEXMessage.User>({ cookie, method: 'GET', path: '/api/v1/user', req }),

        update: (cookie: string, req: {
            oldPassword?: string /* ''  */
            newPassword?: string /* ''  */
            newPasswordConfirm?: string /* ''  */
            username?: string /* ''  Username can only be set once. To reset, email support.*/
            country?: string /* ''  Country of residence.*/
            pgpPubKey?: string /* ''  PGP Public Key. If specified, automated emails will be sentwith this key.*/
        }) => BitMEXRESTAPI__http<BitMEXMessage.User>({ cookie, method: 'PUT', path: '/api/v1/user', req }),

        getCommission: (cookie: string, req: {}) => BitMEXRESTAPI__http<BitMEXMessage.UserCommissionsBySymbol>({ cookie, method: 'GET', path: '/api/v1/user/commission', req }),

        getMargin: (cookie: string, req: {
            currency?: string /* ''  */
        }) => BitMEXRESTAPI__http<BitMEXMessage.Margin>({ cookie, method: 'GET', path: '/api/v1/user/margin', req }),

        communicationToken: (cookie: string, req: {
            token: string /* ''  */
            platformAgent: string /* ''  */
        }) => BitMEXRESTAPI__http<BitMEXMessage.CommunicationToken[]>({ cookie, method: 'POST', path: '/api/v1/user/communicationToken', req })
    },

    UserEvent: {

        get: (cookie: string, req: {
            count?: number /* 'double'  Number of results to fetch.*/
            startId?: number /* 'double'  Cursor for pagination.*/
        }) => BitMEXRESTAPI__http<BitMEXMessage.UserEvent[]>({ cookie, method: 'GET', path: '/api/v1/userEvent', req })
    }
}