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
import { get波动率 } from './realData'
import { 委托检测step } from './task/委托检测step'
import { 自动交易step } from './task/自动交易step'


//运行的账户
//cookie --> Account
const accountDic = new Map<string, Account>()
if (config.orderServer !== undefined) {
    kvs(config.orderServer).forEach(({ k, v }) => {

        const account = new Account({ accountName: k, cookie: v })

        account.runTask(
            止损step({
                symbol: 'XBTUSD',
                初始止损点: () => to范围({
                    min: 3,
                    max: 18,
                    value: get波动率('XBTUSD') / 4,
                }),
                推止损: 盈利点 => {
                    const 波动率 = get波动率('XBTUSD')
                    if (盈利点 >= to范围({ min: 5, max: 30, value: 波动率 / 5 + 5 })) {
                        return 3
                    }
                    else if (盈利点 >= to范围({ min: 5, max: 15, value: 波动率 / 10 + 5 })) {
                        return 0
                    } else {
                        return NaN
                    }
                }
            })
        )

        account.runTask(
            止损step({
                symbol: 'ETHUSD',
                初始止损点: () => to范围({
                    min: 0.3,
                    max: 0.9,
                    value: get波动率('ETHUSD') / 10 + 0.2,
                }),
                推止损: 盈利点 => {
                    const 波动率 = get波动率('ETHUSD')
                    if (盈利点 >= to范围({ min: 0.3, max: 3, value: 波动率 / 5 + 0.3 })) {
                        return 0.2
                    }
                    else if (盈利点 >= to范围({ min: 0.3, max: 1.5, value: 波动率 / 10 + 0.3 })) {
                        return 0
                    } else {
                        return NaN
                    }
                }
            })
        )

        account.runTask(委托检测step('XBTUSD'))
        account.runTask(委托检测step('ETHUSD'))


        account.runTask(自动交易step('XBTUSD'))
        // account.runTask(自动交易step('ETHUSD')) //参数不一样

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

server.func.自动交易_开关 = async req => {
    const account = accountDic.get(req.cookie)
    if (account === undefined) throw 'cookie不存在'
    if (req.symbol === 'XBTUSD' || req.symbol === 'ETHUSD') {
        account.jsonSync.data.symbol[req.symbol].自动交易.____set(req.value)
        return true
    } else {
        return false
    }
} 