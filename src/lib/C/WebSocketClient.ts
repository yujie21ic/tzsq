import * as WebSocket from 'ws'
const SocksProxyAgent = require('socks-proxy-agent')

const pingTimeout = 2000

export class WebSocketClient {

    onStatusChange = () => { }
    onData = (obj: any) => { }

    private ws?: WebSocket
    private createWS: () => WebSocket
    private _isConnected = false

    constructor(p: {
        url: string
        ss?: boolean
        headers?: { [key: string]: string }
    }) {
        const options: WebSocket.ClientOptions = {}

        if (p.ss) {
            options.agent = new SocksProxyAgent('socks://127.0.0.1:1080')
        }

        if (p.headers !== undefined) {
            options.headers = p.headers
        }

        this.createWS = () => new WebSocket(p.url, options)
        this.connect()
    }

    sendJSON(obj: any) {
        if (this.ws !== undefined && this.isConnected) {
            try {
                this.ws.send(JSON.stringify(obj))
            } catch (error) {

            }
        }
    }

    get isConnected() {
        return this._isConnected
    }

    private connect = () => {
        this.ws = this.createWS()

        this.ws.onopen = () => {
            if (this._isConnected === false) {
                this._isConnected = true
                this.onStatusChange()
            }
            this.pingPong()
        }

        this.ws.onerror = this.ws.onclose = this.reconnect

        this.ws.onmessage = e => this.onData(JSON.parse(e.data + ''))
    }

    private reconnect = () => {
        this.destory()
        setTimeout(this.connect, 100)
    }


    private pingPong() {
        const { ws } = this
        if (ws === undefined) return

        let pong = true

        ws.addEventListener('pong', () => pong = true)

        const f = () => {
            if (ws === this.ws) {
                if (pong === false) {
                    this.reconnect()
                } else {
                    pong = false
                    ws.ping()
                    setTimeout(f, pingTimeout)
                }
            }
        }
        f()
    }

    destory() {
        if (this.ws !== undefined) {
            this.ws.onopen = this.ws.onerror = this.ws.onclose = this.ws.onmessage = () => { }
            this.ws.removeAllListeners('pong')
            this.ws.close()
            this.ws.terminate()
            this.ws = undefined
        }

        if (this._isConnected) {
            this._isConnected = false
            this.onStatusChange()
        }
    }
} 