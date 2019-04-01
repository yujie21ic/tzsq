import { DataClient } from './RealDataServer/DataClient'
import { _________________TickBase } from './_________________TickBase'
import { registerCommand } from './lib/UI/registerCommand'
import { windowExt } from './windowExt'
import { RealDataBase } from './RealDataServer/RealDataBase'
import { theme } from './lib/Chart/theme'

import * as csv_parse from 'csv-parse'
import * as fs from 'fs'
import { fix浮点 } from './lib/F/fix浮点'
import { BaseType } from './lib/BaseType'
import { timeID } from './lib/F/timeID'
import { get成交性质 } from './lib/F/get成交性质'

theme.右边空白 = 0

class Tick复盘 extends _________________TickBase {

    title = new Date(windowExt.startTime).toLocaleString()
    real = new DataClient.RealData__History()

    constructor(element: HTMLElement) {
        super(element, 20)

        document.body.ondrop = e => {
            e.stopPropagation()
            e.preventDefault()
            const path = e.dataTransfer!.files[0].path
            const str = fs.readFileSync(path, { encoding: 'utf-8' }).toString()

            let last: {
                side: BaseType.Side
                price: number
                累计成交量: number
                持仓量: number
            } | undefined


            const data: BaseType.KLine[] = []
            const orderBook: BaseType.OrderBook[] = []

            csv_parse(str, {}, (err, records: any[]) => {
                console.log(err, records)

                records.forEach(arr => {
                    const obj = {
                        合约代码: String(arr[1]),
                        时间: String(arr[4]),
                        毫秒: fix浮点(Number(arr[5])),
                        最新价: fix浮点(Number(arr[6])),
                        累计成交量: fix浮点(Number(arr[7])),//???????????
                        盘口买价: fix浮点(Number(arr[15])),
                        盘口买量: fix浮点(Number(arr[16])),
                        盘口卖价: fix浮点(Number(arr[13])),
                        盘口卖量: fix浮点(Number(arr[14])),
                        持仓量: fix浮点(Number(arr[19])),//???????????????
                    }

                    //last 初始化
                    if (last === undefined) {
                        last = {
                            side: obj.最新价 >= obj.盘口卖价 ? 'Sell' : 'Buy',
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
                        data.push({
                            id: timeID.timestampTo500msID(timestamp),
                            open: obj.最新价,
                            high: obj.最新价,
                            low: obj.最新价,
                            close: obj.最新价,
                            buySize: side === 'Buy' ? size : 0,
                            sellSize: side === 'Sell' ? size : 0,
                            buyCount: side === 'Buy' ? 1 : 0,
                            sellCount: side === 'Sell' ? 1 : 0,
                            成交性质: get成交性质({
                                side,
                                size,
                                持仓量新增,
                            }),
                        })
                    }
                    else {
                        data.push({
                            id: timeID.timestampTo500msID(timestamp),
                            open: obj.最新价,
                            high: obj.最新价,
                            low: obj.最新价,
                            close: obj.最新价,
                            buySize: 0,
                            sellSize: 0,
                            buyCount: 0,
                            sellCount: 0,
                            成交性质: '不知道',
                        })
                    }

                    orderBook.push({
                        id: timeID.timestampTo500msID(timestamp),
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

                this.real.ctpLoad(data, orderBook)

            })
        }







        this.nowTickSymbol = windowExt.symbol

        if (windowExt.startTime !== 0) {
            this.real = new DataClient.RealData__History()
            this.real.load(windowExt.startTime)
        }

        registerCommand('load', '时间', v => {
            this.real = new DataClient.RealData__History()
            this.real.load(new Date(String(v)).getTime())
        })

        window.onkeydown = e => {
            if (e.keyCode === 32) {
                this.加速 = true
            }
        }

        window.onkeyup = e => {
            if (e.keyCode === 32) {
                this.加速 = false
            }
            if (e.keyCode === 37) {
                this.快退 = true
            }
            if (e.keyCode === 39) {
                this.快进 = true
            }
        }
    }

    加速 = false
    快退 = false
    快进 = false

    c = 0
    getLeftRight() {
        const d = this.real.dataExt[this.nowTickSymbol]

            ; (window as any)['d'] = d

        const d2 = this.real.dataExt

        let right2 = this.nowChart === '波动_测试' ? Math.max(d.bitmex.波动_测试.累计买.length) - 1 :
            this.nowChart === 'ctp波动_测试' ? Math.max(d2.ctp.波动_测试.累计买.length) - 1 :
                this.nowChart.indexOf('螺纹') !== -1 ? Math.max(this.real.dataExt.ctp.价格.length, this.real.dataExt.ctp.盘口.length) - 1 :
                    Math.max(d.binance.价格.length, d.hopex.价格.length, d.bitmex.价格.length, d.bitmex.买.盘口.length, d.bitmex.卖.盘口.length) - 1





        if (right2 === 0) {
            this.c = 0
        } else {
            let 速度 = 1
            if (this.加速) 速度 = 500
            if (this.快进) {
                this.快进 = false
                速度 = 10 * 60 * 2 * 60
            }
            if (this.快退) {
                this.快退 = false
                速度 = -10 * 60 * 2 * 60
            }

            this.c += 速度 / 60 * (1000 / RealDataBase.单位时间)
        }
        //2分钟前的直接显示
        const right = Math.min(120 * (1000 / RealDataBase.单位时间) + Math.floor(this.c), right2)
        const left = Math.max(0, right - this.showCount)
        return { left, right }
    }

}

new Tick复盘(document.querySelector('#root') as HTMLElement)


    ; (window as any)['log'] = (arr: ArrayLike<any>) => {
        const x: any = []
        for (let i = 0; i < arr.length; i++) {
            x.push(arr[i])
        }
        console.log(JSON.stringify(x))
    }