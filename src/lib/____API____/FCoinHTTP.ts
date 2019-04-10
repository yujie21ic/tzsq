import { JSONRequest } from '../F/JSONRequest'
import { config } from '../../config'
import { queryStringStringify } from '../F/queryStringStringify'
import { base64 } from '../F/base64'
import { createHmac } from 'crypto'
import { BaseType } from '../BaseType'

const __ = {
    secret: '',
    key: '',
}

export const f2 = <T>(p: { url: string, param?: any }) => { //url参数 需要字母按顺序来
    const TIMESTAMP = Date.now() + ''
    const method = p.param ? 'POST' : 'GET'
    const postBody = p.param ? JSON.stringify(p.param) : ''
    const SIGNATURE = createHmac('sha1', __.secret).update(base64(`${method}${p.url}${TIMESTAMP}${postBody}`)).digest().toString('base64')
    return JSONRequest<T>({
        url: p.url,
        method,
        body: postBody,
        ss: config.ss,
        headers: {
            'FC-ACCESS-KEY': __.key,
            'FC-ACCESS-SIGNATURE': SIGNATURE,
            'FC-ACCESS-TIMESTAMP': TIMESTAMP,
            'Content-Type': 'application/json;charset=UTF-8'
        }
    })
}

const f1 = <T>(p: { url: string, cookie: string, param?: any }) =>
    JSONRequest<T>({
        url: p.url,
        method: p.param ? 'POST' : 'GET',
        body: p.param,
        ss: config.ss,
        headers: {
            cookie: `prd-token="${p.cookie}"`,
            referer: `https://exchange.fcoin.com/ex/spot/main/btc/usdt`,
            token: p.cookie,
        }
    })



export const FCoinHTTP = {
    getActiveOrders: async (cookie: string, p: { symbol: string }) =>
        f1<{
            data: {
                created_at: number
                symbol: string
                type: 'buy_limit' | 'sell_limit'
                amount: string
                price: number
                finished_at: number
            }[]
        }>({
            cookie,
            url: 'https://exchange.fcoin.com/api/web/v1/orders/active-orders?' + queryStringStringify({
                account_type: 'margin',
                limit: 100,
                symbol: p.symbol,
            }),
        }),

    getBalances: async (cookie: string) =>
        f1<{
            data: {
                leveraged_account_resp_list: {
                    available_quote_currency_amount: string //usdt
                    available_base_currency_amount: string //btc
                    leveraged_account_type: string //btcusdt
                }[]
            }
        }>({
            cookie,
            url: 'https://exchange.fcoin.com/openapi/v3/leveraged/accounts/balances',
        }),


    order: async (cookie: string, p: { symbol: string, side: BaseType.Side, price: number, size: number }) =>
        f1<{
            data: string
        }>({
            cookie,
            url: 'https://exchange.fcoin.com/api/web/v1/orders',
            param: {
                account_type: 'margin',
                amount: String(p.size),
                exchange: 'main',
                price: String(p.price),
                source: 'web',
                symbol: p.symbol,
                type: p.side === 'Buy' ? 'buy_limit' : 'sell_limit',
            }
        }),
}