import { WebSocketClient } from '../C/WebSocketClient'
import { BaseType } from '../BaseType'
import { BitMEXMessage } from './BitMEXMessage'
import { config } from '../../config'

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

type WSData = {
    announcement: BitMEXMessage.Announcement[]
    chat: BitMEXMessage.Chat[]
    connected: BitMEXMessage.ConnectedUsers[]
    funding: BitMEXMessage.Funding[]
    instrument: BitMEXMessage.Instrument[]
    insurance: BitMEXMessage.Insurance[]
    liquidation: BitMEXMessage.Liquidation[]
    orderBookL2: BitMEXMessage.OrderBookL2[]
    orderBook10: OrderBook10[]
    publicNotifications: BitMEXMessage.GlobalNotification[]
    quote: BitMEXMessage.Quote[]
    quoteBin1m: BitMEXMessage.Quote[]
    quoteBin5m: BitMEXMessage.Quote[]
    quoteBin1h: BitMEXMessage.Quote[]
    quoteBin1d: BitMEXMessage.Quote[]
    settlement: BitMEXMessage.Settlement[]
    trade: BitMEXMessage.Trade[]
    tradeBin1m: BitMEXMessage.TradeBin[]
    tradeBin5m: BitMEXMessage.TradeBin[]
    tradeBin1h: BitMEXMessage.TradeBin[]
    tradeBin1d: BitMEXMessage.TradeBin[]
    affiliate: BitMEXMessage.Affiliate[]
    execution: BitMEXMessage.Execution[]
    order: BitMEXMessage.Order[]
    margin: BitMEXMessage.Margin[]
    position: BitMEXMessage.Position[]
    privateNotifications: BitMEXMessage.GlobalNotification[]
    transact: BitMEXMessage.Transaction[]
    wallet: BitMEXMessage.Wallet[]
}

const findItem = (a: any, arr: any[], keys: any[]) => arr.find(b => keys.every(key => a[key] === b[key]))

export class BitMEXWSAPI {

    data: WSData = {
        announcement: [],
        chat: [],
        connected: [],
        funding: [],
        instrument: [],
        insurance: [],
        liquidation: [],
        orderBookL2: [],
        orderBook10: [],
        publicNotifications: [],
        quote: [],
        quoteBin1m: [],
        quoteBin5m: [],
        quoteBin1h: [],
        quoteBin1d: [],
        settlement: [],
        trade: [],
        tradeBin1m: [],
        tradeBin5m: [],
        tradeBin1h: [],
        tradeBin1d: [],
        affiliate: [],
        execution: [],
        order: [],
        margin: [],
        position: [],
        privateNotifications: [],
        transact: [],
        wallet: [],
    }
    onFilled = (side: BaseType.Side, price: number) => { }
    onmessage = (fd: FrameData) => { }

    private ws: WebSocketClient

    get isConnected() {
        return this.ws.isConnected
    }

    onStatusChange = () => { }

    constructor(cookie: string, subscribe: { theme: SubscribeTheme, filter?: string }[]) {

        const ws = this.ws = new WebSocketClient({
            headers: {
                Cookie: cookie
            },
            ss: config.ss,
            url: 'wss://www.bitmex.com/realtime'
        })

        let keysDic = new Map<string, string[]>()

        let hasPartial = new Map<string, boolean>()

        ws.onStatusChange = () => {
            this.onStatusChange()
            if (ws.isConnected) {

                //有情况发数组 服务器返回不对  只能一次一次的发
                subscribe.map(v => ws.send({
                    op: 'subscribe',
                    args: v.filter !== undefined ? v.theme + ':' + v.filter : v.theme
                }))

                keysDic = new Map<string, string[]>()
                hasPartial = new Map<string, boolean>()
            }
        }

        ws.onData = obj => {
            const fd: FrameData = obj

            const { table, keys, action, data } = fd

            if (table === 'trade') {//数据太多了 不存啊!!
                this.onmessage(fd)
                return
            }

            //table消息
            if (table !== undefined) {

                //主键
                if (keys !== undefined) {
                    keysDic.set(table, keys)
                }


                //完全替换数据
                if (action === 'partial') {
                    this.data[table] = data as any//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                    hasPartial.set(table, true)
                }
                //插入新数据
                else if (action === 'insert') {
                    this.data[table] = [...this.data[table], ...data as any]

                    //限制长度
                    // if (this.data[table].length > 100) {
                    //     this.data[table] = this.data[table].slice(this.data[table].length - 100)
                    // }
                }
                //更新 删除
                else {
                    const keys = keysDic.get(table)

                    if (keys !== undefined) {

                        //更新数据
                        if (action === 'update') {

                            this.data[table] = (this.data[table] as any[]).map(a => {
                                const item = findItem(a, data, keys)
                                return item === undefined ? a : { ...a, ...item }
                            })

                            if (table === 'order') {

                                const fill = this.data.order.find(v => v.ordStatus === 'Filled')
                                if (fill !== undefined) {
                                    this.onFilled(fill.side as BaseType.Side, fill.price)
                                }

                                this.data.order = this.data.order.filter(v =>
                                    v.ordStatus !== 'Rejected'  //拒绝委托
                                    &&
                                    v.ordStatus !== 'Canceled'  //取消委托
                                    &&
                                    v.ordStatus !== 'Filled'    //完全成交
                                )
                            }
                        }

                        //删除数据
                        else if (action === 'delete') {

                            this.data[table] = (this.data[table] as any[]).filter(a =>
                                findItem(a, data, keys) === undefined
                            )
                        }
                    }

                }

                if (hasPartial.has(table)) {
                    this.onmessage(fd)
                }
            }
        }

    }
}