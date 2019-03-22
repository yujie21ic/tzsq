import { BaseType } from '../../BaseType'
import { JSONRequest } from '../../C/JSONRequest'
import { config } from '../../../config'

export const hopex市价开仓和止损BTC = async (cookie: string, p: { size: number, stopPrice: number, side: BaseType.Side }) => {
    JSONRequest({
        url: 'https://web.hopex.com/api/v1/gateway/User/Order?culture=zh-CN',
        method: 'POST',
        body: {
            'param': {
                'side': p.side === 'Sell' ? '1' : '2',
                'orderQuantity': String(p.size),
                'market': 'BTCUSDT',
                'marketCode': 'BTCUSDT',
                'contractCode': 'BTCUSDT',
                'lang': 'zh-CN',
            }
        },
        ss: config.ss,
        headers: {
            Origin: 'https://www.hopex.com',
            Referer: 'https://www.hopex.com/trade?marketCode=BTCUSDT',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36',
            conversionCurrency: 'USD',
            Authorization: cookie.split('=')[1],
            Cookie: cookie,
        }
    })
    const 止损side = p.side === 'Sell' ? 'Buy' : 'Sell'

    JSONRequest({
        url: 'https://web.hopex.com/api/v1/gateway/User/ConditionOrder?culture=zh-CN',
        method: 'POST',
        body: {
            'param': {
                contractCode: 'BTCUSDT',
                expectedPrice: String(止损side === 'Sell' ? String(p.stopPrice - 100) : String(p.stopPrice + 100)),
                expectedQuantity: String(p.size),
                lang: 'zh-CN',
                market: 'BTCUSDT',
                marketCode: 'BTCUSDT',
                side: 止损side === 'Sell' ? 1 : 2,
                trigPrice: String(止损side === 'Sell' ? String(p.stopPrice) : String(p.stopPrice)),
                trigType: 'market_price',
                type: 'LimitLoss',
            }
        },
        ss: config.ss,
        headers: {
            Origin: 'https://www.hopex.com',
            Referer: 'https://www.hopex.com/trade?marketCode=BTCUSDT',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36',
            conversionCurrency: 'USD',
            Authorization: cookie.split('=')[1],
            Cookie: cookie,
        }
    })

    return { data: true }
}
