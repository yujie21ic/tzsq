import * as dgram from 'dgram'
import { safeJSONParse } from '../../lib/F/safeJSONParse'
import { fix浮点 } from '../../lib/F/fix浮点'
import { BaseType } from '../../lib/BaseType'
import { TradeAndOrderBook } from './TradeAndOrderBook'
import { get成交性质 } from '../../lib/F/get成交性质'

export class CTP extends TradeAndOrderBook<string>{

    private udpServer = dgram.createSocket('udp4')

    private last: {
        side: BaseType.Side
        price: number
        累计成交量: number
        持仓量: number
    } | undefined


    run() {
        this.statusObservable.next({ isConnected: true })

        this.udpServer.on('message', message => {
            const arr = safeJSONParse(message.toString())

            if (Array.isArray(arr) === false) return

            const obj = {
                合约代码: String(arr[0]),
                时间: String(arr[1]),
                毫秒: fix浮点(Number(arr[2])),
                最新价: fix浮点(Number(arr[3])),
                累计成交量: fix浮点(Number(arr[4])),
                盘口买价: fix浮点(Number(arr[5])),
                盘口买量: fix浮点(Number(arr[6])),
                盘口卖价: fix浮点(Number(arr[7])),
                盘口卖量: fix浮点(Number(arr[8])),
                持仓量: fix浮点(Number(arr[9])),
                成交金额: fix浮点(Number(arr[10])),
            }


            //last 初始化
            if (this.last === undefined) {
                this.last = {
                    side: obj.最新价 >= obj.盘口卖价 ? 'Sell' : 'Buy',
                    price: obj.最新价,
                    累计成交量: obj.累计成交量,
                    持仓量: obj.持仓量,
                }
                return
            }


            //last
            if (this.last.price !== obj.最新价) {
                this.last.side = obj.最新价 > this.last.price ? 'Buy' : 'Sell'
                this.last.price = obj.最新价
            }

            const size = obj.累计成交量 - this.last.累计成交量
            const side = this.last.side
            const 持仓量新增 = obj.持仓量 - this.last.持仓量

            this.last.累计成交量 = obj.累计成交量
            this.last.持仓量 = obj.持仓量


            const date = new Date()
            const [h, m, s] = obj.时间.split(':').map(Number)
            date.setHours(h)
            date.setMinutes(m)
            date.setSeconds(s)
            date.setMilliseconds(obj.毫秒)

            const timestamp = 0

            this.tradeObservable.next({
                symbol: obj.合约代码,
                timestamp,
                side,
                size,
                price: obj.最新价,
                成交性质: get成交性质({
                    side,
                    size,
                    持仓量新增,
                })
            })

            this.orderBookObservable.next({
                symbol: obj.合约代码,
                timestamp,
                buy: [{
                    price: obj.盘口买价,
                    size: obj.盘口买量,
                }],
                sell: [{
                    price: obj.盘口卖价,
                    size: obj.盘口卖量,
                }],
            })

        })

        this.udpServer.bind(8888, '127.0.0.1')
    }
}