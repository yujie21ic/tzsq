import { BitMEXWSAPI } from '../BitMEX/BitMEXWSAPI'
import { BitMEXOrderAPI } from '../BitMEX/BitMEXOrderAPI'
import { logToFile } from '../../lib/C/logToFile'
import { BaseType } from '../../lib/BaseType'
import { JSONSync } from '../../lib/C/JSONSync'

const symbol = () => ({
    任务开关: {
        自动开仓摸顶: {
            value: false,
            text: '',
        },
        自动开仓抄底: {
            value: false,
            text: '',
        },
        自动开仓追涨: {
            value: false,
            text: '',
        },
        自动开仓追跌: {
            value: false,
            text: '',
        },
        自动止盈: {
            value: false,
            text: '',
        },
        自动止盈波段: {
            value: false,
            text: '',
        },
        自动推止损: {
            value: true,
            text: '',
        }
    },

    委托: {
        id: '',
        side: '' as BaseType.Side,
        cumQty: 0,      //成交数量
        orderQty: 0,    //委托数量
        price: 0,
    },
    止损价格: 0,
    仓位数量: 0,
    开仓均价: 0,
})

export const createJSONSync = () =>
    new JSONSync({
        symbol: {
            XBTUSD: symbol(),
            ETHUSD: symbol(),
        }
    })

type Order = {
    type: '限价' | '限价只减仓' | '止损'
    timestamp: number
    id: string
    side: BaseType.Side
    cumQty: number      //成交数量
    orderQty: number    //委托数量
    price: number
}

export class BitmexPositionAndOrder {

    accountName: string
    cookie: string
    ws: BitMEXWSAPI
    bitMEXOrderAPI: BitMEXOrderAPI

    jsonSync = createJSONSync()

    活动委托 = {
        XBTUSD: [] as Order[],
        ETHUSD: [] as Order[],
    }

    constructor(p: { accountName: string, cookie: string }) {
        this.accountName = p.accountName
        this.cookie = p.cookie

        this.bitMEXOrderAPI = new BitMEXOrderAPI({
            cookie: p.cookie,
            重试几次: 10,
            重试休息多少毫秒: 10,
        })
        this.bitMEXOrderAPI.log = logToFile(this.accountName + '.txt')

        this.ws = new BitMEXWSAPI(p.cookie, [
            { theme: 'margin' },
            { theme: 'position' },
            { theme: 'order' },
        ])

        this.ws.增量同步数据.log = logToFile(this.accountName + '.txt')
    }

}