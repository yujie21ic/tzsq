import { WebSocketClient } from '../lib/C/WebSocketClient'
import { deepMapNullToNaN } from '../lib/F/deepMapNullToNaN'
import { JSONRPCClient } from '../lib/C/JSONRPC'
import { funcList, createJSONSync } from './____API____'

export class OrderClient {

    static rpc = new JSONRPCClient({
        funcList,
        host: '34.245.14.85',
        port: 3456
    })

    jsonSync = createJSONSync()

    private ws = new WebSocketClient({
        url: 'ws://34.245.14.85:4567'
    })

    private 收到了消息 = false

    constructor(cookie: string) {
        this.ws.onStatusChange = () => {
            this.收到了消息 = false
            if (this.ws.isConnected) {
                this.ws.send({ cookie })
            }
        }
        this.ws.onData = obj => {
            this.收到了消息 = true
            this.jsonSync.set(deepMapNullToNaN(obj))
        }
    }

    get isConnected() {
        return this.ws.isConnected && this.收到了消息
    }
} 