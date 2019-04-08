import { BaseType } from '../BaseType'
import { JSONRequest } from '../F/JSONRequest'
import { config } from '../../config'
import { queryStringStringify } from '../F/queryStringStringify'

const header = {
    Origin: 'https://www.hopex.com',
    Referer: 'https://www.hopex.com/trade?marketCode=BTCUSDT',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36',
}

const HopexRESTAPI__http = <T>(p: { cookie?: string, url: string, param?: any }) =>
    JSONRequest<T>({
        url: p.url,
        method: p.param ? 'POST' : 'GET',
        body: p.param ? { param: p.param } : undefined,
        ss: config.ss,
        headers: p.cookie ?
            {
                ...header,
                conversionCurrency: 'USD',
                Authorization: p.cookie.split('=')[1],
                Cookie: p.cookie,
            } :
            header
    })



export const HopexRESTAPI = {

    maker: async (cookie: string, p: { symbol: BaseType.HopexSymbol, size: number, price: number, side: BaseType.Side }) =>
        HopexRESTAPI__http({
            cookie,
            url: 'https://web.hopex.com/api/v1/gateway/User/Order?culture=zh-CN',
            param: {
                lang: 'zh-CN',
                market: p.symbol,
                marketCode: p.symbol,
                contractCode: p.symbol,
                orderPrice: String(p.price),
                orderQuantity: String(p.size),
                side: p.side === 'Sell' ? '1' : '2',
            },
        }),


    taker: async (cookie: string, p: { symbol: BaseType.HopexSymbol, size: number, side: BaseType.Side }) =>
        HopexRESTAPI__http({
            cookie,
            url: 'https://web.hopex.com/api/v1/gateway/User/Order?culture=zh-CN',
            param: {
                'side': p.side === 'Sell' ? '1' : '2',
                'orderQuantity': String(p.size),
                'market': p.symbol,
                'marketCode': p.symbol,
                'contractCode': p.symbol,
                'lang': 'zh-CN',
            },
        }),

    stop: async (cookie: string, p: { symbol: BaseType.HopexSymbol, side: BaseType.Side, price: number }) =>
        HopexRESTAPI__http({
            cookie,
            url: 'https://web.hopex.com/api/v1/gateway/User/ConditionOrder?culture=zh-CN',
            param: {
                expectedPrice: String(p.side === 'Sell' ? String(p.price - 100) : String(p.price + 100)),
                expectedQuantity: String(100000),
                lang: 'zh-CN',
                market: p.symbol,
                marketCode: p.symbol,
                contractCode: p.symbol,
                side: p.side === 'Sell' ? 1 : 2,
                trigPrice: String(p.side === 'Sell' ? String(p.price) : String(p.price)),
                trigType: 'market_price',
                type: 'LimitLoss',
            },
        }),

    cancel: async (cookie: string, p: { orderID: number, contractCode: BaseType.HopexSymbol }) =>
        HopexRESTAPI__http({
            cookie,
            url: `https://web.hopex.com/api/v1/gateway/User/CancelOrder?` + queryStringStringify(
                {
                    culture: 'zh-CN',
                    contractCode: 'BTCUSDT',  //?????????????????????????????????
                    orderId: p.orderID,
                },
            )
        }),

    getPositions: async (cookie: string) =>
        HopexRESTAPI__http<{
            data?: {
                contractCode: BaseType.HopexSymbol
                positionQuantity: string // "+2"  "-2"
                entryPriceD: number
            }[]
        }>({
            cookie,
            url: 'https://web.hopex.com/api/v1/gateway/User/Positions?culture=zh-CN',
        }),


    getOpenOrders: async (cookie: string) =>
        HopexRESTAPI__http<{
            data?: {
                contractCode: BaseType.HopexSymbol
                fillQuantity: string    //已成交
                leftQuantity: string    //总
                ctime: string //"2019-04-07 18:36:24"
                orderPrice: string
                orderId: number
                side: string
            }[]
        }>({
            cookie,
            url: 'https://web.hopex.com/api/v1/gateway/User/OpenOrders?culture=zh-CN',
        }),

    getConditionOrders: async (cookie: string) =>
        HopexRESTAPI__http<{
            data?: {
                result?: {
                    contractCode: BaseType.HopexSymbol
                    taskStatusD: '未触发'
                    timestamp: number
                    taskId: number
                    trigPrice: string
                    taskTypeD: '买入止损' | '卖出止损'
                }[]
            }
        }>({
            cookie,
            url: 'https://web.hopex.com/api/v1/gateway/User/ConditionOrders?limit=10&culture=zh-CN',
            param: {
                endTime: '0',
                lang: 'zh-CN',
                // market: 'BTCUSDT',    //应该是网页调用错了
                // marketCode: 'BTCUSDT',
                // contractCode: 'BTCUSDT',
                side: '0',
                startTime: '0',
                taskStatusList: ['1'],
            },
        }),
}