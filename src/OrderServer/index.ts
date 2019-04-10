import { JSONRPCServer } from '../lib/F/JSONRPC'
import { funcList } from './funcList'
import { BitmexPositionAndOrder } from '../lib/____API____/PositionAndOrder/BitmexPositionAndOrder'
import * as WebSocket from 'ws'
import { config } from '../config'
import { typeObjectParse } from '../lib/F/typeObjectParse'
import { safeJSONParse } from '../lib/F/safeJSONParse'
import { kvs } from '../lib/F/kvs'
import { toRange } from '../lib/F/toRange'
import { toBuySellPriceFunc } from '../lib/F/toBuySellPriceFunc'
import { XBTUSD摸顶抄底追涨追跌 } from '../XBTUSD摸顶抄底追涨追跌'
import { PositionAndOrder } from '../lib/____API____/PositionAndOrder/PositionAndOrder'
import { Hopex__ETH止损 } from '../Hopex__ETH止损'



//运行的账户
//cookie --> Account
const accountDic = new Map<string, PositionAndOrder>()
if (config.orderServer !== undefined) {
    kvs(config.orderServer).forEach(({ k, v }) => {
        const account = new BitmexPositionAndOrder({
            accountName: k,
            cookie: v.cookie,
            hopexCookie: v.hopexCookie,
            fcoinCookie: v.fcoinCookie,
        })
        account.runTask(new XBTUSD摸顶抄底追涨追跌())
        account.runTask(new Hopex__ETH止损())
        accountDic.set(v.cookie, account) //key is cookie 
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
server.run()

server.func.取消委托 = async req => {
    const account = accountDic.get(req.cookie)
    if (account === undefined) throw 'cookie不存在'
    return await account.cancel({ orderID: req.orderID })
}


server.func.市价平仓 = async req => {
    const account = accountDic.get(req.cookie)
    if (account === undefined) throw 'cookie不存在'
    return await account.close({ symbol: req.symbol, text: '手动市价平仓' })
}

server.func.下单 = async req => {
    const account = accountDic.get(req.cookie)
    if (account === undefined) throw 'cookie不存在'

    if (req.symbol !== 'XBTUSD' && req.symbol !== 'ETHUSD') {
        throw 'symbol不存在'
    }

    const getOrderPrice = () =>
        account.realData.getOrderPrice({
            symbol: req.symbol,
            side: req.side,
            type: req.type,
            位置: Math.floor(toRange({ min: 0, max: 4, value: req.位置 }))
        })

    const getPrice = req.最低_最高 ?
        () => {
            const price = getOrderPrice()
            const { high, low } = account.realData.get期货多少秒内最高最低(req.symbol, 5)
            if (req.side === 'Buy') {
                return Math.min(price, low)
            } else {
                return Math.max(price, high)
            }
        } :
        getOrderPrice

    if (req.type === 'maker' && isNaN(getPrice())) {
        throw '服务器还没有 买1 卖1 价格'
    }

    const { 仓位数量 } = account.jsonSync.rawData.symbol[req.symbol]

    const 活动委托 = account.jsonSync.rawData.symbol[req.symbol].委托列表.filter(v => v.type !== '止损')

    if (活动委托.length > 1) {
        throw '已经有委托了'
    }
    else if (活动委托.length === 1) {
        //更新 限价委托
        if (
            (
                活动委托[0].type === '限价' ||
                活动委托[0].type === '限价只减仓'
            )
            && 活动委托[0].side === req.side && req.type === 'maker') {
            //ws返回有时间  直接给委托列表加一条记录??
            return await account.updateMaker({
                orderID: 活动委托[0].id,
                price: toBuySellPriceFunc(req.side, getPrice),
            })
        } else {
            throw '已经有委托了'
        }
    }


    if ((仓位数量 > 0 && req.side !== 'Sell') ||
        (仓位数量 < 0 && req.side !== 'Buy')
    ) {
        throw '不能加仓'
    }

    return req.type === 'taker' ?
        (req.最低_最高 ?
            false :
            await account.taker({
                symbol: req.symbol,
                side: req.side,
                size: req.size,
                text: '手动taker',
            })
        ) :
        //ws返回有时间  直接给委托列表加一条记录??
        await account.maker({
            symbol: req.symbol,
            side: req.side,
            size: req.size,
            price: toBuySellPriceFunc(req.side, getPrice),
            reduceOnly: 仓位数量 !== 0,
            text: '手动maker',
        })
}

server.func.任务_开关 = async req => {
    const account = accountDic.get(req.cookie)
    if (account === undefined) throw 'cookie不存在'
    if (req.symbol !== 'XBTUSD' && req.symbol !== 'ETHUSD' && req.symbol !== 'Hopex_BTC' && req.symbol !== 'Hopex_ETH') throw 'symbol不存在'

    const { 任务开关 } = account.jsonSync.data.symbol[req.symbol]
    if (Object.keys(任务开关).some(v => v === req.任务名字) === false) throw '任务不存在'

    任务开关[req.任务名字].____set(req.value)

    return true
}

//
console.log('运行中...   记得 客户端 打开量化 ...')