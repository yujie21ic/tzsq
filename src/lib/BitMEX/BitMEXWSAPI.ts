import { WebSocketClient } from '../C/WebSocketClient'
import { BitMEXMessage } from './BitMEXMessage'
import { config } from '../../config'
import { BitMEXWSAPI__增量同步数据 } from './BitMEXWSAPI__增量同步数据'
import { BaseType } from '../BaseType'

type OrderBook10 = {
    symbol: string
    bids: [number, number][]
    asks: [number, number][]
    timestamp: string
}

type SubscribeTheme =
    //下面的订阅主题是无需身份验证：
    'announcement' |// 网站公告
    'chat' |        // Trollbox 聊天室
    'connected' |   // 已连接用户/机器人的统计数据
    'funding' |     // 掉期产品的资金费率更新 每个资金时段发送（通常是8小时）
    'instrument' |  // 产品更新，包括交易量以及报价
    'insurance' |   // 每日保险基金的更新
    'liquidation' | // 进入委托列表的强平委托
    'orderBookL2' | // 完整的 level 2 委托列表
    'orderBook10' | //  前10层的委托列表，用传统的完整委托列表推送
    'publicNotifications' | // 全系统的告示（用于段时间的消息）
    'quote' |       // 最高层的委托列表
    'quoteBin1m' |  // 每分钟报价数据
    'quoteBin5m' |  // 每5分钟报价数据
    'quoteBin1h' |  // 每个小时报价数据
    'quoteBin1d' |  // 每天报价数据
    'settlement' |  // 结算信息
    'trade' |       // 实时交易
    'tradeBin1m' |  // 每分钟交易数据
    'tradeBin5m' |  // 每5分钟交易数据
    'tradeBin1h' |  // 每小时交易数据
    'tradeBin1d' |  // 每天交易数据

    //下列主题要求进行身份验证︰
    'affiliate' |   // 邀请人状态，已邀请用户及分红比率
    'execution' |   // 个别成交，可能是多个成交
    'order' |       // 你委托的更新
    'margin' |      // 你账户的余额和保证金要求的更新
    'position' |    // 你仓位的更新
    'privateNotifications' | // 个人的通知，现时并未使用
    'transact' |     // 资金提存更新
    'wallet'       // 比特币余额更新及总提款存款


type FrameData = (
    { table: 'announcement', data: BitMEXMessage.Announcement[] } |
    { table: 'chat', data: BitMEXMessage.Chat[] } |
    { table: 'connected', data: BitMEXMessage.ConnectedUsers[] } |
    { table: 'funding', data: BitMEXMessage.Funding[] } |
    { table: 'instrument', data: BitMEXMessage.Instrument[] } |
    { table: 'insurance', data: BitMEXMessage.Insurance[] } |
    { table: 'liquidation', data: BitMEXMessage.Liquidation[] } |
    { table: 'orderBookL2', data: BitMEXMessage.OrderBookL2[] } |
    { table: 'orderBook10', data: OrderBook10[] } |
    { table: 'publicNotifications', data: BitMEXMessage.GlobalNotification[] } |
    { table: 'quote', data: BitMEXMessage.Quote[] } |
    { table: 'quoteBin1m', data: BitMEXMessage.Quote[] } |
    { table: 'quoteBin5m', data: BitMEXMessage.Quote[] } |
    { table: 'quoteBin1h', data: BitMEXMessage.Quote[] } |
    { table: 'quoteBin1d', data: BitMEXMessage.Quote[] } |
    { table: 'settlement', data: BitMEXMessage.Settlement[] } |
    { table: 'trade', data: BitMEXMessage.Trade[] } |
    { table: 'tradeBin1m', data: BitMEXMessage.TradeBin[] } |
    { table: 'tradeBin5m', data: BitMEXMessage.TradeBin[] } |
    { table: 'tradeBin1h', data: BitMEXMessage.TradeBin[] } |
    { table: 'tradeBin1d', data: BitMEXMessage.TradeBin[] } |
    { table: 'affiliate', data: BitMEXMessage.Affiliate[] } |
    { table: 'execution', data: BitMEXMessage.Execution[] } |
    { table: 'order', data: BitMEXMessage.Order[] } |
    { table: 'margin', data: BitMEXMessage.Margin[] } |
    { table: 'position', data: BitMEXMessage.Position[] } |
    { table: 'privateNotifications', data: BitMEXMessage.GlobalNotification[] } |
    { table: 'transact', data: BitMEXMessage.Transaction[] } |
    { table: 'wallet', data: BitMEXMessage.Wallet[] }
) & {
    action: 'partial' | 'update' | 'insert' | 'delete'
    keys?: string[]
}


export class BitMEXWSAPI {

    data = {
        announcement: new Map<string, BitMEXMessage.Announcement>(),
        chat: new Map<string, BitMEXMessage.Chat>(),
        connected: new Map<string, BitMEXMessage.ConnectedUsers>(),
        funding: new Map<string, BitMEXMessage.Funding>(),
        instrument: new Map<string, BitMEXMessage.Instrument>(),
        insurance: new Map<string, BitMEXMessage.Insurance>(),
        liquidation: new Map<string, BitMEXMessage.Liquidation>(),
        orderBookL2: new Map<string, BitMEXMessage.OrderBookL2>(),
        orderBook10: new Map<string, OrderBook10>(),
        publicNotifications: new Map<string, BitMEXMessage.GlobalNotification>(),
        quote: new Map<string, BitMEXMessage.Quote>(),
        quoteBin1m: new Map<string, BitMEXMessage.Quote>(),
        quoteBin5m: new Map<string, BitMEXMessage.Quote>(),
        quoteBin1h: new Map<string, BitMEXMessage.Quote>(),
        quoteBin1d: new Map<string, BitMEXMessage.Quote>(),
        settlement: new Map<string, BitMEXMessage.Settlement>(),
        trade: new Map<string, BitMEXMessage.Trade>(),
        tradeBin1m: new Map<string, BitMEXMessage.TradeBin>(),
        tradeBin5m: new Map<string, BitMEXMessage.TradeBin>(),
        tradeBin1h: new Map<string, BitMEXMessage.TradeBin>(),
        tradeBin1d: new Map<string, BitMEXMessage.TradeBin>(),
        affiliate: new Map<string, BitMEXMessage.Affiliate>(),
        execution: new Map<string, BitMEXMessage.Execution>(),
        order: new Map<string, BitMEXMessage.Order>(),
        margin: new Map<string, BitMEXMessage.Margin>(),
        position: new Map<string, BitMEXMessage.Position>(),
        privateNotifications: new Map<string, BitMEXMessage.GlobalNotification>(),
        transact: new Map<string, BitMEXMessage.Transaction>(),
        wallet: new Map<string, BitMEXMessage.Wallet>(),
    }

    onmessage = (fd: FrameData) => { }

    private ws: WebSocketClient

    get isConnected() {
        return this.ws.isConnected
    }

    onStatusChange = () => { }

    增量同步数据 = new BitMEXWSAPI__增量同步数据()

    constructor(cookie: string, subscribe: { theme: SubscribeTheme, filter?: string }[]) {

        const ws = this.ws = new WebSocketClient({
            headers: {
                Cookie: cookie
            },
            ss: config.ss,
            url: 'wss://www.bitmex.com/realtime'
        })



        ws.onStatusChange = () => {
            this.onStatusChange()
            if (ws.isConnected) {

                //有情况发数组 服务器返回不对  只能一次一次的发
                subscribe.map(v => ws.sendJSON({
                    op: 'subscribe',
                    args: v.filter !== undefined ? v.theme + ':' + v.filter : v.theme
                }))

                this.keysDic = new Map<string, string[]>()
                this.hasPartial = new Map<string, boolean>()
            }
        }

        ws.onData = obj => this.onAction(obj)

    }

    keysDic = new Map<string, string[]>()

    hasPartial = new Map<string, boolean>()



    deleteOrder(v: BitMEXMessage.Order) {
        if (v.ordStatus === 'Rejected' || v.ordStatus === 'Canceled' || v.ordStatus === 'Filled') {
            this.data.order.delete(v.orderID) //
        }
    }



    onAction(fd: FrameData) {

        let keys = fd.keys
        const table = fd.table
        const action = fd.action
        const data = fd.data as any[]

        //数据太多了 不存 
        if (table === 'trade') {
            this.onmessage(fd)
            return
        }


        if (table !== undefined) {

            //主键
            if (keys !== undefined) {
                this.keysDic.set(table, keys)
            }

            keys = (this.keysDic.get(table) || [])


            const __dic__ = this.data[table] as Map<any, any>

            //完全替换数据
            if (action === 'partial') {

                this.data[table] = new Map()

                data.forEach((v: any) => {
                    const key = JSON.stringify((keys || []).map(k => v[k]))
                    __dic__.set(key, v)
                })

                this.hasPartial.set(table, true)

                //本地维护仓位数量 初始化
                if (table === 'position') {
                    (data as BitMEXMessage.Position[]).forEach(v => {
                        this.增量同步数据.仓位数量.partial(v.symbol as BaseType.BitmexSymbol, v.currentQty)
                    })
                }
            }

            //插入新数据
            else if (action === 'insert') {

                data.forEach((v: any) => {
                    const key = JSON.stringify((keys || []).map(k => v[k]))
                    //有了的不添加了
                    if (__dic__.has(key) === false) {
                        __dic__.set(key, v)
                        if (table === 'order') {
                            this.增量同步数据.onOrder(v)
                            this.deleteOrder(v)
                        }
                    }
                })


                //本地维护仓位数量 增量
                if (table === 'execution') {
                    (data as BitMEXMessage.Execution[]).forEach(v => {
                        if (v.ordType === 'StopLimit' && v.ordStatus === 'Filled') {
                            this.增量同步数据.仓位数量.update(v.symbol as BaseType.BitmexSymbol, v.cumQty * (v.side === 'Buy' ? 1 : -1))
                        }
                    })
                }
            }


            //更新
            else if (action === 'update') {
                data.forEach((v: any) => {
                    const key = JSON.stringify((keys || []).map(k => v[k]))

                    const old = __dic__.get(key)
                    const newV = old === undefined ? v : { ...old, ...v }
                    __dic__.set(key, newV)

                    //本地维护仓位数量 增量
                    if (table === 'order') {
                        this.增量同步数据.onOrder(newV)
                        this.deleteOrder(newV)
                    }
                })
            }

            //删除
            else if (action === 'delete') {
                data.forEach((v: any) => {
                    const key = JSON.stringify((keys || []).map(k => v[k]))
                    __dic__.delete(key)
                })
            }
        }


        if (this.hasPartial.has(table)) {
            this.onmessage(fd)
        }
    }
}