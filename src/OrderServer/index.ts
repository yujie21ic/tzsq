import { JSONRPCServer } from '../lib/C/JSONRPC'
import { funcList } from './funcList'
import { Account, 下单和止损, realData } from './Account'
import * as WebSocket from 'ws'
import { config } from '../config'
import { typeObjectParse } from '../lib/F/typeObjectParse'
import { safeJSONParse } from '../lib/F/safeJSONParse'
import { BitMEXOrderAPI } from '../lib/BitMEX/BitMEXOrderAPI'

const accountDic = new Map<string, Account>()      // cookie --> Account

if (config.orderServiceCookie !== undefined) {
    config.orderServiceCookie.forEach(cookie =>
        accountDic.set(cookie, new Account(cookie))
    )
}
else {
    console.log('orderServiceCookie 没有设置')
}

//ws
const online = new Map<WebSocket, { unsubscribe: () => void }>()         // ws --> cookie
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
//


//http
const server = new JSONRPCServer({
    funcList: funcList,
    port: 3456
})

server.func.走平挂单 = async req => {
    const account = accountDic.get(req.cookie)
    if (account === undefined) return 'cookie不存在'

    if (isNaN(realData.getOrderPrice(req.symbol, req.side, req.type))) {
        return '服务器还没有 买1 卖1 价格'
    }

    if (req.延迟下单.length === 0) {
        const success = await 下单和止损(req.cookie, req)
        return success ? '' : '下单和止损失败'
    }
    else if (req.延迟下单.length === 1) {
        account.开仓回合({
            type: req.type,
            side: req.side,
            size: req.size,
            止损点: req.止损点,
            现货: req.延迟下单[0].现货,
            期货: {
                ...req.延迟下单[0].期货,
                symbol: req.symbol
            }
        })
        return ''
    }
    else {
        return '延迟下单 长度只能为1'
    }
}

server.func.市价平仓全部 = async req => {
    const success = await BitMEXOrderAPI.close(req.cookie, req.symbol)
    return success ? '' : '市价平仓全部失败'
}

server.func.取消全部活动委托 = async req => {
    const success = await BitMEXOrderAPI.cancelAll(req.cookie, req.symbol)
    return success ? '' : '取消全部活动委托'
}