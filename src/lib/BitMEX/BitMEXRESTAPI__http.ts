import { queryStringStringify } from '../F/queryStringStringify'
import { JSONRequest } from '../C/JSONRequest'
import { config } from '../../config'
import { mapObjIndexed } from '../F/mapObjIndexed'

export const BitMEXRESTAPI__http = async <T>(obj: { method: string, path: string, cookie: string, req: any }) => {

    const { method } = obj


    //'JSON' 没处理
    //enum数组 改成 用逗号分隔
    const req = mapObjIndexed(v => Array.isArray(v) ? v.join(',') : v, obj.req)

    const url = 'https://www.bitmex.com' + (
        (method === 'GET' || method === 'DELETE') ?
            (obj.path + '?' + queryStringStringify(req)) :
            obj.path
    )

    const body = (method === 'GET' || method === 'DELETE') ? undefined : req

    return await JSONRequest<T>({
        headers: obj.cookie === '' ? undefined : {
            Cookie: obj.cookie,
            Referer: `https://www.bitmex.com/app/trade/XBTUSD`
        },
        url,
        method,
        body,
        ss: config.ss
    })
}