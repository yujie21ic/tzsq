import * as dgram from 'dgram'
import { safeJSONParse } from '../../lib/F/safeJSONParse'
import { Subject } from 'rxjs';

export class CTP {

    private udpServer = dgram.createSocket('udp4')

    subject = new Subject<{
        合约代码: string
        时间: string
        毫秒: number
        最新价: number
        成交量: number
        盘口买价: number
        盘口买量: number
        盘口卖价: number
        盘口卖量: number
        持仓量: number
        成交金额: number
    }>()
    

    run() {
        this.udpServer.on('message', (message, remote) => {
            const arr = safeJSONParse(message.toString())
            if (Array.isArray(arr)) {
                this.subject.next({
                    合约代码: String(arr[0]),
                    时间: String(arr[1]),
                    毫秒: Number(arr[2]),
                    最新价: Number(arr[3]),
                    成交量: Number(arr[4]),
                    盘口买价: Number(arr[5]),
                    盘口买量: Number(arr[6]),
                    盘口卖价: Number(arr[7]),
                    盘口卖量: Number(arr[8]),
                    持仓量: Number(arr[9]),
                    成交金额: Number(arr[10]),
                })
            }
        })

        this.udpServer.bind(8888, '127.0.0.1')
    }
}