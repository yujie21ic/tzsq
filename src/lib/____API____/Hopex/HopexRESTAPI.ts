import { BaseType } from '../../BaseType'
import { JSONRequest } from '../../F/JSONRequest'
import { config } from '../../../config'


const HopexRESTAPI__http = <T>(p: { cookie: string, url: string, param?: any }) =>
    JSONRequest<T>({
        url: p.url,
        method: p.param ? 'POST' : 'GET',
        body: p.param ? { param: p.param } : undefined,
        ss: config.ss,
        headers: {
            Origin: 'https://www.hopex.com',
            Referer: 'https://www.hopex.com/trade?marketCode=BTCUSDT',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36',
            conversionCurrency: 'USD',
            Authorization: p.cookie.split('=')[1],
            Cookie: p.cookie,
        }
    })


export const HopexRESTAPI = {

    login: async (cookie: string, p: { userName: string, password: string }) =>
        HopexRESTAPI__http({
            cookie,
            url: 'https://web.hopex.com/api/v1/User/Login?culture=zh-CN',
            param: {
                loginType: 'pcweb',
                password: p.password,
                registType: 'Email',
                userName: p.userName,
            },
        }),


    taker: async (cookie: string, p: { size: number, side: BaseType.Side }) =>
        HopexRESTAPI__http({
            cookie,
            url: 'https://web.hopex.com/api/v1/gateway/User/Order?culture=zh-CN',
            param: {
                'side': p.side === 'Sell' ? '1' : '2',
                'orderQuantity': String(p.size),
                'market': 'BTCUSDT',
                'marketCode': 'BTCUSDT',
                'contractCode': 'BTCUSDT',
                'lang': 'zh-CN',
            },
        }),

    stop: async (cookie: string, p: { side: BaseType.Side, price: number }) =>
        HopexRESTAPI__http({
            cookie,
            url: 'https://web.hopex.com/api/v1/gateway/User/ConditionOrder?culture=zh-CN',
            param: {
                contractCode: 'BTCUSDT',
                expectedPrice: String(p.side === 'Sell' ? String(p.price - 100) : String(p.price + 100)),
                expectedQuantity: String(100000),
                lang: 'zh-CN',
                market: 'BTCUSDT',
                marketCode: 'BTCUSDT',
                side: p.side === 'Sell' ? 1 : 2,
                trigPrice: String(p.side === 'Sell' ? String(p.price) : String(p.price)),
                trigType: 'market_price',
                type: 'LimitLoss',
            },
        }),

    cancel: async (cookie: string, p: { orderID: number }) =>
        HopexRESTAPI__http({
            cookie,
            url: 'https://web.hopex.com/api/v1/gateway/User/CancelConditionOrder?culture=zh-CN',
            param: {
                contractCode: 'BTCUSDT',
                taskId: p.orderID,
            },
        }),

    getPositions: async (cookie: string) =>
        HopexRESTAPI__http<{
            data: {
                contractCode: 'BTCUSDT'
                positionQuantity: string // "+2"  "-2"
                entryPriceD: number
            }[]
        }>({
            cookie,
            url: 'https://web.hopex.com/api/v1/gateway/User/Positions?culture=zh-CN',
        }),

    getConditionOrders: async (cookie: string) =>
        HopexRESTAPI__http<{
            data?: {
                result: {
                    contractCode: 'BTCUSDT'
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
                contractCode: 'BTCUSDT',
                endTime: '0',
                lang: 'zh-CN',
                market: 'BTCUSDT',
                marketCode: 'BTCUSDT',
                side: '0',
                startTime: '0',
                taskStatusList: ['1'],
            },
        }),
}