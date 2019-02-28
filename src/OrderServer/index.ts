import { JSONRPCServer } from '../lib/C/JSONRPC'
import { funcList } from './____API____'
import { TradeAccount } from './TradeAccount'
import * as WebSocket from 'ws'
import { config } from '../config'
import { typeObjectParse } from '../lib/F/typeObjectParse'
import { safeJSONParse } from '../lib/F/safeJSONParse'
import { kvs } from '../lib/F/kvs'
import { XBTUSD止损step, ETHUSD止损step } from './task/止损step'
import { 委托检测step } from './task/委托检测step'
import { XBTUSD自动开仓step } from './task/自动开仓step'
import { XBTUSD自动止盈波段step } from './task/自动止盈波段step'
import { XBTUSD自动止盈step } from './task/自动止盈step'


//运行的账户
//cookie --> Account
const accountDic = new Map<string, TradeAccount>()
if (config.orderServer !== undefined) {
    kvs(config.orderServer).forEach(({ k, v }) => {

        const account = new TradeAccount({ accountName: k, cookie: v })

        account.runTask(XBTUSD止损step())
        account.runTask(ETHUSD止损step())

        account.runTask(委托检测step('XBTUSD'))
        account.runTask(委托检测step('ETHUSD'))

        account.runTask(XBTUSD自动开仓step())
        account.runTask(XBTUSD自动止盈step())
        account.runTask(XBTUSD自动止盈波段step())

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

server.func.取消委托 = async req => {
    const account = accountDic.get(req.cookie)
    if (account === undefined) throw 'cookie不存在'
    return account.取消委托(req)
}

server.func.市价平仓 = async req => {
    const account = accountDic.get(req.cookie)
    if (account === undefined) throw 'cookie不存在'
    return account.市价平仓(req)
}

server.func.下单 = async req => {
    const account = accountDic.get(req.cookie)
    if (account === undefined) throw 'cookie不存在'
    return account.下单(req)
}

server.func.任务_开关 = async req => {
    const account = accountDic.get(req.cookie)
    if (account === undefined) throw 'cookie不存在'
    if (req.symbol !== 'XBTUSD' && req.symbol !== 'ETHUSD') throw 'symbol不存在'

    const { 任务开关 } = account.jsonSync.data.symbol[req.symbol]
    if (Object.keys(任务开关).some(v => v === req.任务名字) === false) throw '任务不存在'

    任务开关[req.任务名字].value.____set(req.value)

    return true
}

//
console.log('运行中...   记得 客户端 打开量化 ...')