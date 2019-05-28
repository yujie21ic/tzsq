import * as WebSocket from 'ws'
import { BaseType } from '../BaseType'
import { Sampling } from '../F/Sampling'
import { RealDataBase } from './RealDataBase'
import { TradeAndOrderBook } from './TradeAndOrderBook/TradeAndOrderBook'

export class RealData__Server extends RealDataBase {

    private wss?: WebSocket.Server
    private wsDic = new Map<WebSocket, boolean>()

    private tradeAndOrderBookArr: TradeAndOrderBook<any>[]

    onTitle = (str: string) => { }

    private on着笔Dic = Object.create(null) as {
        [symbol: string]: Sampling<BaseType.KLine>
    }

    private on着笔(p: {
        key: string
        xxxxxxxx: {
            data: {
                ____push: (v: BaseType.KLine) => void
                ____updateLast: (v: BaseType.KLine) => void
            },

        }
        timestamp: number
        side: BaseType.Side
        price: number
        size: number
        成交性质?: BaseType.成交性质Type
    }) {
        this.删除历史()

        const tick = Math.floor(p.timestamp / RealDataBase.单位时间)

        if (this.data.startTick === 0) {
            this.jsonSync.data.startTick.____set(tick)
        }
 

        //500ms
        if (this.on着笔Dic[p.key] === undefined) {
            this.on着笔Dic[p.key] = new Sampling<BaseType.KLine>({
                open: '开',
                high: '高',
                low: '低',
                close: '收',
                buySize: '累加',
                buyCount: '累加',
                sellSize: '累加',
                sellCount: '累加',
                成交性质: '收',
            })

            this.on着笔Dic[p.key].onNew2 = item => p.xxxxxxxx.data.____push(item)
            this.on着笔Dic[p.key].onUpdate2 = item => p.xxxxxxxx.data.____updateLast(item)
            this.on着笔Dic[p.key].in2({
                id: this.data.startTick,
                open: NaN,
                high: NaN,
                low: NaN,
                close: NaN,
                //
                buySize: 0,
                buyCount: 0,
                sellSize: 0,
                sellCount: 0,
                成交性质: '不知道',
            })
        }

        this.on着笔Dic[p.key].in2({
            id: tick,
            open: p.price,
            high: p.price,
            low: p.price,
            close: p.price,
            buySize: p.side === 'Buy' ? p.size : 0,
            buyCount: p.side === 'Buy' ? 1 : 0,
            sellSize: p.side === 'Sell' ? p.size : 0,
            sellCount: p.side === 'Sell' ? 1 : 0,
            成交性质: p.成交性质,
        })
    }

    private on盘口Dic = Object.create(null) as {
        [symbol: string]: Sampling<BaseType.OrderBook>
    }

    private on盘口(p: {
        key: string
        xxxxxxxx: {
            ____push: (v: BaseType.OrderBook) => void
            ____updateLast: (v: BaseType.OrderBook) => void
        }
        timestamp: number
        orderBook: BaseType.OrderBook
    }) {
        this.删除历史()
        const tick = Math.floor(p.timestamp / RealDataBase.单位时间)

        if (this.data.startTick === 0) {
            this.jsonSync.data.startTick.____set(tick)
        }

        if (this.on盘口Dic[p.key] === undefined) {
            this.on盘口Dic[p.key] = new Sampling<BaseType.OrderBook>({
                buy: '最新',
                sell: '最新',
            })
            this.on盘口Dic[p.key].onNew2 = item => p.xxxxxxxx.____push(item)
            this.on盘口Dic[p.key].onUpdate2 = item => p.xxxxxxxx.____updateLast(item)
            this.on盘口Dic[p.key].in2({
                id: this.data.startTick,
                buy: [],
                sell: [],
            })
        }

        this.on盘口Dic[p.key].in2(p.orderBook)
    }

    constructor(wsServer = true) {
        super()

        this.tradeAndOrderBookArr = this.getTradeAndOrderBookArr()

        this.重新初始化()//<-----------fix  

        if (wsServer) {
            this.wss = new WebSocket.Server({ port: 6666 })
        }


        let xxx: { [key: string]: boolean } = {}
        const onTitle = () => this.onTitle(JSON.stringify(xxx))

        this.tradeAndOrderBookArr.forEach(vv => {
            vv.statusObservable.subscribe(v => {
                xxx[vv.name] = v.isConnected
                onTitle()
            })
        })


        //runServer
        if (this.wss !== undefined) {
            this.wss.on('connection', ws => {
                try {
                    ws.send(JSON.stringify({
                        path: [],
                        value: this.data
                    }))
                } catch (error) {

                }
                this.wsDic.set(ws, true)
                ws.onerror = ws.onclose = () => this.wsDic.delete(ws)
            })
        }

        this.jsonSync.subject.subscribe(
            op => {
                const str = JSON.stringify(op)
                this.wsDic.forEach((_, ws) => {
                    try { ws.send(str) } catch (error) { }
                })
            }
        )

        this.tradeAndOrderBookArr.forEach(v => {
            v.tradeObservable.subscribe(({ symbol, timestamp, side, size, price }) => {
                this.on着笔({
                    key: v.name + '_' + symbol,
                    xxxxxxxx: this.jsonSync.data[v.name as 'bitmex'][symbol as 'XBTUSD'],
                    timestamp,
                    side: side as BaseType.Side,
                    size,
                    price,
                })

            })

            v.orderBookObservable.subscribe(({ symbol, timestamp, buy, sell }) => {
                this.on盘口({
                    key: v.name + '_' + symbol,
                    xxxxxxxx: this.jsonSync.data[v.name as 'bitmex'][symbol as 'XBTUSD'].orderBook,
                    timestamp,
                    orderBook: {
                        id: Math.floor(timestamp / RealDataBase.单位时间),
                        buy,
                        sell,
                    }
                })
            })
        })

    }
}