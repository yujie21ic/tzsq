import { RealKLineBase } from './RealKLineBase'

// import { JSONRequest } from '../../F/JSONRequest'    //http
// import { WebSocketClient } from '../../F/WebSocketClient'  //ws


export class BinanceRealKLine extends RealKLineBase {

    constructor() {
        super()

        this.kline.push( {
            id: 1,
            open: 100,
            high: 200,
            low: 50,
            close: 300,
        })
         

        this.onFirstLoad()


    }
}