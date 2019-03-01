import { BitMEXWSAPI } from '../BitMEX/BitMEXWSAPI'
import { BitMEXOrderAPI } from '../BitMEX/BitMEXOrderAPI'
import { logToFile } from '../../lib/C/logToFile'
import { BaseType } from '../../lib/BaseType'

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