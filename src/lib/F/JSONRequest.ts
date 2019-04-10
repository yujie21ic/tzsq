import * as request from 'request'
import { safeJSONParse } from './safeJSONParse'
const Agent = require('socks5-https-client/lib/Agent')

export type JSONRequestError = '网络错误' | '服务器返回错误'

export const JSONRequest = <T>({
    url,
    method = 'GET',
    body,
    ss = false,
    headers = {}
}: {
    url: string
    method?: string
    body?: any //string的话 不编码
    ss?: boolean
    headers?: { [key: string]: string }
}) => new Promise<{
    error?: JSONRequestError
    data?: T
    msg?: string
}>(resolve => {

    const requestOptions: request.OptionsWithUrl = {
        timeout: 1000 * 60,//超时1分钟
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            ...headers
        },
        url,
        method
    }

    if (ss) {
        requestOptions.agentClass = Agent
        requestOptions.agentOptions = {
            socksHost: '127.0.0.1',
            socksPort: 1080
        } as any
    }

    if (body !== undefined) {
        requestOptions.body = typeof body === 'string' ? body : JSON.stringify(body)
    }

    request(requestOptions, (error, response) => {
        if (response === undefined) {
            resolve({
                error: '网络错误',
                msg: String(error),
            })
        }
        else if (response.statusCode !== 200) {
            resolve({
                error: '服务器返回错误',
                msg: String(response.body),
            })
        }
        else {
            resolve({ data: safeJSONParse(response.body) })
        }
    })

})