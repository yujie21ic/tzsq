import { JSONRPCServer } from '../lib/C/JSONRPC'
import { funcList } from './____API____'
import { Account } from './Account'
import * as WebSocket from 'ws'
import { config } from '../config'
import { typeObjectParse } from '../lib/F/typeObjectParse'
import { safeJSONParse } from '../lib/F/safeJSONParse'
import { BitMEXOrderAPI } from '../lib/BitMEX/BitMEXOrderAPI'
import { 下单 } from './realData'


//运行的账户  需要到 orderServiceCookie 设置
//cookie --> Account
const accountDic = new Map<string, Account>()
if (config.orderServiceCookie !== undefined) {
    config.orderServiceCookie.forEach(cookie => accountDic.set(cookie, new Account(cookie)))
} else {
    console.log('orderServiceCookie 没有设置')
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
            ws.send(
                JSON.stringify({
                    path: [],
                    value: account.jsonSync.rawData
                })
            )
            online.set(ws,
                account.jsonSync.subject.subscribe(op =>
                    ws.send(JSON.stringify(op))
                )
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
const server = new JSONRPCServer({
    funcList,
    port: 3456,
})

server.func.下单 = async req => await 下单(req.cookie, req)

server.func.市价平仓全部 = async req => await BitMEXOrderAPI.close(req.cookie, req.symbol)

server.func.取消全部活动委托 = async req => {
    const account = accountDic.get(req.cookie)
    if (account === undefined) {
        throw 'cookie不存在'
    }
    return await BitMEXOrderAPI.close(req.cookie, req.symbol)
}