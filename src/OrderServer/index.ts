import { JSONRPCServer } from '../lib/C/JSONRPC'
import { funcList } from './____API____'
import { Account } from './Account'
import * as WebSocket from 'ws'
import { config } from '../config'
import { typeObjectParse } from '../lib/F/typeObjectParse'
import { safeJSONParse } from '../lib/F/safeJSONParse'
import { BitMEXOrderAPI } from '../lib/BitMEX/BitMEXOrderAPI'
import { realData } from './realData'
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
const server = new JSONRPCServer({ funcList, port: 3456 })

server.func.set_任务_止盈 = async req => {
    const account = accountDic.get(req.cookie)
    if (account === undefined) {
        throw 'cookie不存在'
    }

    account.jsonSync.data.symbol[req.symbol].任务.止盈.____set(req.value)
    return true
}

server.func.set_任务_止盈第一次平到多少仓位 = async req => {
    const account = accountDic.get(req.cookie)
    if (account === undefined) {
        throw 'cookie不存在'
    }

    account.jsonSync.data.symbol[req.symbol].任务.止盈第一次平到多少仓位.____set(
        Math.floor(Math.abs(isNaN(req.value) ? 0 : req.value))
    )
    return true
}

server.func.set_任务_止损 = async req => {
    const account = accountDic.get(req.cookie)
    if (account === undefined) {
        throw 'cookie不存在'
    }

    account.jsonSync.data.symbol[req.symbol].任务.止损.____set(req.value)
    return true
}

server.func.取消委托 = async req => await BitMEXOrderAPI.cancel(req.cookie, req.orderID)

server.func.市价平仓 = async req => await BitMEXOrderAPI.close(req.cookie, req.symbol)

server.func.下单 = async req => {
    const getPrice = () => realData.getOrderPrice(req.symbol, req.side, req.type)

    if (isNaN(getPrice())) {
        throw '服务器还没有 买1 卖1 价格'
    }

    return req.type === 'taker' ?
        await BitMEXOrderAPI.taker(req.cookie, {
            symbol: req.symbol,
            side: req.side,
            size: req.size,
        }) :
        await BitMEXOrderAPI.maker(req.cookie, {
            symbol: req.symbol,
            side: req.side,
            size: req.size,
            price: getPrice,
            reduceOnly: false,
        })
}


server.func.下单_最低_最高 = async req => {

    const getPrice = () => {
        const price = realData.getOrderPrice(req.symbol, req.side, req.type)
        const { high, low } = realData.get期货多少秒内最高最低(req.symbol, 5)
        if (req.side === 'Buy') {
            return Math.min(price, low)
        } else {
            return Math.max(price, high)
        }
    }

    if (isNaN(getPrice())) {
        throw '服务器还没有 买1 卖1 价格  或者5秒内最高最低价'
    }

    return req.type === 'taker' ?
        await BitMEXOrderAPI.市价触发(req.cookie, {
            symbol: req.symbol,
            side: req.side,
            size: req.size,
            price: getPrice(),
        }) :
        await BitMEXOrderAPI.maker(req.cookie, {
            symbol: req.symbol,
            side: req.side,
            size: req.size,
            price: getPrice,
            reduceOnly: false,
        })
}