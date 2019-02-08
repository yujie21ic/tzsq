import { JSONRequest } from './lib/C/JSONRequest'
import { BaseType } from './lib/BaseType'
import { config } from './config'

export namespace HopexAPI {
    export const 市价开仓BTC = async (cookie: string, p: { size: number, side: BaseType.Side }) => {
        JSONRequest({
            url: 'https://www.hopex.com/api/v1/gateway/User/Order',
            method: 'POST',
            body: {
                'param': {
                    'side': p.side === 'Sell' ? '1' : '2',
                    'orderQuantity': p.size,
                    'source': '浏览器，我是市价测试单,用户id：undefined,邮箱：undefined',
                    'market': 'BTCUSDT',
                    'marketCode': 'BTCUSDT',
                    'contractCode': 'BTCUSDT',
                    'lang': 'cn'
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
    }
}