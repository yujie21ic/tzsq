import { BitMEXOrderAPI } from '../BitMEX/BitMEXOrderAPI'


export class BitmexPositionAndOrder {

    bitMEXOrderAPI: BitMEXOrderAPI

    get ws() { return this.bitMEXOrderAPI.ws }

    get accountName() { return this.bitMEXOrderAPI.accountName }

    get jsonSync() { return this.bitMEXOrderAPI.jsonSync }

    get 活动委托() { return this.bitMEXOrderAPI.活动委托 }

    constructor(p: { accountName: string, cookie: string }) {

        this.bitMEXOrderAPI = new BitMEXOrderAPI({
            accountName: p.accountName,
            cookie: p.cookie,
        })
    }

}