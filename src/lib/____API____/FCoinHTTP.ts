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

export const f2 = <T>(p: { url: string, method: 'POST' | 'GET', param?: any }) => { //url参数 需要字母按顺序来
    const TIMESTAMP = Date.now() + ''
    const postBody = p.param ? JSON.stringify(p.param) : ''
    const SIGNATURE = createHmac('sha1', __.secret).update(base64(`${p.method}${p.url}${TIMESTAMP}${postBody}`)).digest().toString('base64')
    return JSONRequest<T>({
        url: p.url,
        method: p.method,
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

const f1 = <T>(p: { url: string, method: 'POST' | 'GET', cookie: string, param?: any }) =>
    JSONRequest<T>({
        url: p.url,
        method: p.method,
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
                id: string
                created_at: number
                symbol: string
                type: 'buy_limit' | 'sell_limit'
                amount: string
                filled_amount: string
                price: string
            }[]
        }>({
            cookie,
            method: 'GET',
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
            method: 'GET',
            url: 'https://exchange.fcoin.com/openapi/v3/leveraged/accounts/balances',
        }),


    order: async (cookie: string, p: { symbol: string, side: BaseType.Side, price: number, size: number }) =>
        f1<{
            data: string
        }>({
            cookie,
            method: 'POST',
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


    cancel: async (cookie: string, id: string) =>
        f1({
            cookie,
            method: 'POST',
            url: `https://exchange.fcoin.com/api/web/v1/orders/${id}/submit-cancel`,
        }),
}