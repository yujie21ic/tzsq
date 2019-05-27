import { WebSocketClient } from '../F/WebSocketClient'
import { deepMapNullToNaN } from '../F/deepMapNullToNaN'
import { JSONRPCClient } from '../F/JSONRPC'
import { funcList } from './funcList'
import { config } from '../config'
import { createJSONSync } from './PositionAndOrder'

export class OrderClient {

    static rpc = new JSONRPCClient({
        funcList,
        host: config.orderServerIP + '',
        port: 3456
    })

    jsonSync = createJSONSync()

    private ws = new WebSocketClient({
        name: 'OrderClient',
        url: `ws://${config.orderServerIP}:4567`,
    })

    private 收到了消息 = false

    constructor(cookie: string) {
        this.ws.onStatusChange = () => {
            this.收到了消息 = false
            if (this.ws.isConnected) {
                this.ws.sendJSON({ cookie })
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