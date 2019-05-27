import { WebSocketClient } from './F/WebSocketClient'

let a = new WebSocketClient({
    ss: true,
    name: 'test',
    url: 'wss://api.hopex.com/ws',
})

a.onData = () => {

}