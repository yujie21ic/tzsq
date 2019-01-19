import * as http from 'http'
import { JSONRequest, JSONRequestError } from './JSONRequest'
import { typeObjectParse } from '../F/typeObjectParse'
import { mapObjIndexed } from '../F/mapObjIndexed'
import { safeJSONParse } from '../F/safeJSONParse'

type FuncList = {
    [funcName: string]: {
        req: any
        res: any
    }
}

export class JSONRPCServer<T extends FuncList> {

    func: {
        [K in keyof T]?: (req: T[K]['req']) => Promise<T[K]['res']>
    } = {}

    constructor(p: {
        funcList: T
        port: number
    }) {

        http.createServer(async (req, res) => {

            let data = ''
            req.setEncoding('utf8')
            req.on('data', chunk => data += chunk)
            req.on('end', async () => {
                const arr = safeJSONParse(data)
                if (Array.isArray(arr) && arr.length === 2 && typeof arr[0] === 'string') {
                    const name = arr[0]
                    const param = arr[1]
                    const f = this.func[name]
                    const define = p.funcList[name]
                    if (f !== undefined && define !== undefined) {
                        try {
                            const ret = await f(typeObjectParse(define.req)(param))
                            res.write(JSON.stringify(ret))
                            res.end()
                        } catch (e) {
                            res.writeHead(404)
                            res.write('出错了')
                            res.end()
                        }
                        return
                    }
                }
                res.writeHead(404)
                res.write('error')
                res.end()
            })
        }).listen(p.port)
    }
}


export class JSONRPCClient<T extends FuncList> {

    func: {
        [K in keyof T]: (req: T[K]['req']) => Promise<{
            error?: JSONRequestError
            data?: T[K]['res']
            msg?: string
        }>
    }

    constructor(p: {
        funcList: T
        host: string
        port: number
    }) {

        this.func = mapObjIndexed(
            (value, key) =>
                async (req: any) => {
                    const { error, data, msg } = await JSONRequest({
                        url: `http://${p.host}:${p.port}`,
                        method: 'POST',
                        body: [key, req],
                    })
                    return {
                        error: error,
                        data: error ? undefined : typeObjectParse(value.res)(data),
                        msg,
                    }
                },
            p.funcList
        )

    }
} 