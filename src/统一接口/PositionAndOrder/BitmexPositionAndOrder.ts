import { BitMEXOrderAPI } from '../BitMEX/BitMEXOrderAPI'
import { logToFile } from '../../lib/C/logToFile'


export class BitmexPositionAndOrder {

    accountName: string
    bitMEXOrderAPI: BitMEXOrderAPI

    get ws() { return this.bitMEXOrderAPI.ws }

    get jsonSync() { return this.bitMEXOrderAPI.jsonSync }
    
    get 活动委托() { return this.bitMEXOrderAPI.活动委托 }

    constructor(p: { accountName: string, cookie: string }) {
        this.accountName = p.accountName

        this.bitMEXOrderAPI = new BitMEXOrderAPI({
            accountName: p.accountName,
            cookie: p.cookie,
            重试几次: 10,
            重试休息多少毫秒: 10,
        })
        this.bitMEXOrderAPI.log = logToFile(this.accountName + '.txt')
    }

}