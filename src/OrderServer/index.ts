import { JSONRPCServer } from '../lib/C/JSONRPC'
import { funcList } from './____API____'
import { Account } from './Account'
import * as WebSocket from 'ws'
import { config } from '../config'
import { typeObjectParse } from '../lib/F/typeObjectParse'
import { safeJSONParse } from '../lib/F/safeJSONParse'
import { BitMEXOrderAPI } from '../lib/BitMEX/BitMEXOrderAPI'
import { kvs } from '../lib/F/kvs'
import { 止损step } from './task/止损step'
import { to范围 } from '../lib/F/to范围'
import { lastNumber } from '../lib/F/lastNumber'
import { realData } from './realData'
import { 委托检测step } from './task/委托检测step'


//运行的账户
//cookie --> Account
const accountDic = new Map<string, Account>()
if (config.orderServer !== undefined) {
    kvs(config.orderServer).forEach(({ k, v }) => {

        const account = new Account({ accountName: k, cookie: v })

        account.runTask(止损step('XBTUSD', () => to范围({
            min: 3,
            max: 18,
            value: lastNumber(realData.dataExt.XBTUSD.期货.波动率) / 4,
        })))

        account.runTask(止损step('ETHUSD', () => to范围({
            min: 0.1,
            max: 0.9,
            value: lastNumber(realData.dataExt.XBTUSD.期货.波动率) / 100 + 0.1,
        })))

        account.runTask(委托检测step('XBTUSD'))
        account.runTask(委托检测step('ETHUSD'))

        accountDic.set(v, account)
    })
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