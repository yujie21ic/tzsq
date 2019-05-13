import { WebSocketClient } from "./lib/F/WebSocketClient";

let a = new WebSocketClient({
    name: 'test',
    url: 'wss://ws.ix.com/v1/deal/FUTURE_BTCUSD',
})

a.onData = () => {

}