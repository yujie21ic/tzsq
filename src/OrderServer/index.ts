import { JSONRPCServer } from '../lib/C/JSONRPC'
import { funcList } from './____API____'
import { Account } from './Account'
import * as WebSocket from 'ws'
import { config } from '../config'
import { typeObjectParse } from '../lib/F/typeObjectParse'
import { safeJSONParse } from '../lib/F/safeJSONParse'
import { BitMEXOrderAPI } from '../lib/BitMEX/BitMEXOrderAPI'
import { kvs } from '../lib/F/kvs'


//运行的账户
//cookie --> Account
const accountDic = new Map<string, Account>()
if (config.orderServer !== undefined) {
    kvs(config.orderServer).forEach(({ k, v }) => accountDic.set(v, new Account({ accountName: k, cookie: v })))
} else {
    console.log('运行的账户 没有设置')
}


//ws --> unsubscribe
const online = new Map<WebSocket, { unsubscribe: () => void }>()
const wss = new WebSocket.Server({ port: 4567 })
wss.on('connection', ws => {
    online.set(ws, { unsubscribe: () => { } })
    ws.onmessage = e => {
        ws.onmessage = () => { }
        const account = accountDic.get(typeObjectParse({ cookie: '' })(safeJSONParse(e.data + '')).cookie)
        if (account !== undefined) {
            try {
                ws.send(
                    JSON.stringify({
                        path: [],
                        value: account.jsonSync.rawData
                    })
                )
            } catch (err) { }

            online.set(ws,
                account.jsonSync.subject.subscribe(op => {
                    try {
                        ws.send(JSON.stringify(op))
                    } catch (err) { }
                })
            )
        }
    }
    ws.onerror = ws.onclose = () => {
        const f = online.get(ws)
        if (f !== undefined) {
            f.unsubscribe()
            online.delete(ws)
        }
    }
})


//http
const server = new JSONRPCServer({ funcList, port: 3456 })

server.func.取消委托 = async req =>
    await BitMEXOrderAPI.cancel(req.cookie, req.orderID)

server.func.市价平仓 = async req =>
    await BitMEXOrderAPI.close(req.cookie, req.symbol)

server.func.下单 = async req => {
    const account = accountDic.get(req.cookie)
    if (account === undefined) throw 'cookie不存在'
    return account.下单(req)
} 