import * as dgram from 'dgram'
import { safeJSONParse } from '../lib/F/safeJSONParse'
import { fix浮点 } from '../lib/F/fix浮点'
import { BaseType } from '../lib/BaseType'
import { TradeAndOrderBook } from './TradeAndOrderBook'
import { get成交性质 } from '../lib/F/get成交性质'

export class CTPTradeAndOrderBook extends TradeAndOrderBook<string>{

    private udpServer = dgram.createSocket('udp4')

    private dic = Object.create(null) as {
        [symbol: string]: {
            side: BaseType.Side
            price: number
            累计成交量: number
            持仓量: number
        } | undefined
    }

    name = 'ctp'


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

                盘口买1价: fix浮点(Number(arr[5])),
                盘口买1量: fix浮点(Number(arr[6])),
                盘口卖1价: fix浮点(Number(arr[7])),
                盘口卖1量: fix浮点(Number(arr[8])),

                // 盘口买2价: fix浮点(Number(arr[9])),
                // 盘口买2量: fix浮点(Number(arr[10])),
                // 盘口卖2价: fix浮点(Number(arr[11])),
                // 盘口卖2量: fix浮点(Number(arr[12])),

                // 盘口买3价: fix浮点(Number(arr[13])),
                // 盘口买3量: fix浮点(Number(arr[14])),
                // 盘口卖3价: fix浮点(Number(arr[15])),
                // 盘口卖3量: fix浮点(Number(arr[16])),

                // 盘口买4价: fix浮点(Number(arr[17])),
                // 盘口买4量: fix浮点(Number(arr[18])),
                // 盘口卖4价: fix浮点(Number(arr[19])),
                // 盘口卖4量: fix浮点(Number(arr[20])),

                // 盘口买5价: fix浮点(Number(arr[21])),
                // 盘口买5量: fix浮点(Number(arr[22])),
                // 盘口卖5价: fix浮点(Number(arr[23])),
                // 盘口卖5量: fix浮点(Number(arr[24])),

                持仓量: fix浮点(Number(arr[25])),
                成交金额: fix浮点(Number(arr[26])),
            }



            const last = this.dic[obj.合约代码]
            if (last === undefined) {
                this.dic[obj.合约代码] = {
                    side: obj.最新价 >= obj.盘口卖1价 ? 'Sell' : 'Buy',
                    price: obj.最新价,
                    累计成交量: obj.累计成交量,
                    持仓量: obj.持仓量,
                }
                return
            }


            //last
            if (last.price !== obj.最新价) {
                last.side = obj.最新价 > last.price ? 'Buy' : 'Sell'
                last.price = obj.最新价
            }

            const size = obj.累计成交量 - last.累计成交量
            const side = last.side
            const 持仓量新增 = obj.持仓量 - last.持仓量

            last.累计成交量 = obj.累计成交量
            last.持仓量 = obj.持仓量


            const date = new Date()
            const [h, m, s] = obj.时间.split(':').map(Number)
            date.setHours(h)
            date.setMinutes(m)
            date.setSeconds(s)
            date.setMilliseconds(obj.毫秒)

            const timestamp = date.getTime()

            if (size !== 0) {
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
                    }),
                })
            }

            this.orderBookObservable.next({
                symbol: obj.合约代码,
                timestamp,
                buy: [
                    {
                        price: obj.盘口买1价,
                        size: obj.盘口买1量,
                    },
                    // {
                    //     price: obj.盘口买2价,
                    //     size: obj.盘口买2量,
                    // },
                    // {
                    //     price: obj.盘口买3价,
                    //     size: obj.盘口买3量,
                    // },
                    // {
                    //     price: obj.盘口买4价,
                    //     size: obj.盘口买4量,
                    // },
                    // {
                    //     price: obj.盘口买5价,
                    //     size: obj.盘口买5量,
                    // },
                ],
                sell: [
                    {
                        price: obj.盘口卖1价,
                        size: obj.盘口卖1量,
                    },
                    // {
                    //     price: obj.盘口卖2价,
                    //     size: obj.盘口卖2量,
                    // },
                    // {
                    //     price: obj.盘口卖3价,
                    //     size: obj.盘口卖3量,
                    // },
                    // {
                    //     price: obj.盘口卖4价,
                    //     size: obj.盘口卖4量,
                    // },
                    // {
                    //     price: obj.盘口卖5价,
                    //     size: obj.盘口卖5量,
                    // },

                ],
            })

        })

        this.udpServer.bind(8888, '127.0.0.1')
    }
}