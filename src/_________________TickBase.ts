import { chartInit } from './Chart'
import { RealDataBase } from './RealDataServer/RealDataBase'
import { formatDate } from './F/formatDate'
import { dialog } from './UI/dialog'
import { Tick行情____config } from './Tick行情____config'
import { keys } from 'ramda'
import { BaseType } from './BaseType'


const 显示秒 = [250, 50, 150, 500, 1000, 2000, 3600, 7200, 20000]

export class _________________TickBase {

    real = new RealDataBase()
    showCount = 显示秒[0] * (1000 / RealDataBase.单位时间)
    nowTickSymbol: BaseType.BitmexSymbol = 'XBTUSD'
    nowChart = keys(Tick行情____config)[0]

    constructor(element: HTMLElement, FPS: number) {

        window.addEventListener('mousedown', e => {
            if (e.button === 0) {
            }
            else if (e.button === 2) {
                dialog.popupMenu([
                    {
                        label: '显示秒',
                        submenu: 显示秒.map(v => ({
                            label: v + '秒',
                            type: 'checkbox' as 'checkbox',
                            checked: v === this.showCount / (1000 / RealDataBase.单位时间),
                            click: () => this.showCount = v * (1000 / RealDataBase.单位时间)
                        }))
                    },
                    {
                        label: '显示图',
                        submenu: keys(Tick行情____config).map(v => ({
                            label: v,
                            type: 'checkbox' as 'checkbox',
                            checked: v === this.nowChart,
                            click: () => this.nowChart = v
                        }))
                    },
                ])
            }
        })



        chartInit(FPS, element, () => {
            const d2 = this.real.dataExt

            const { left, right } = this.getLeftRight()

            const xArr = this.nowChart.indexOf('CTP') !== -1 ? d2.ctp.TA909.时间 : d2.bitmex.XBTUSD.时间

            const xStrArr = this.nowChart.indexOf('CTP') !== -1 ? d2.ctp.TA909.时间str : d2.bitmex.XBTUSD.时间str

            return {
                xStrArr,
                显示y: v => {
                    if (this.nowChart === '波动_测试') return undefined

                    if (v > xArr.length - 1 || v < 0) return undefined

                    const time = xArr[v]
                    const date = new Date(time)

                    if (date.getSeconds() >= 30 && v === right) {
                        return formatDate(date, v => `${v.hh}:${v.mm}:${v.ss}`)
                    }
                    else if (time % 60000 === 0) {
                        return formatDate(date, v => `${v.hh}:${v.mm}`)
                    }
                    else {
                        return undefined
                    }
                },
                left,
                right,
                items: Tick行情____config[this.nowChart]('废弃', this.real.dataExt)
            }
        })
    }

    title = ''


    //getLeftRight______________删掉 ————————————————————DataClient 直接模拟
    getLeftRight() {
        const d2 = this.real.dataExt

        let right = //this.nowChart === '着笔' ? Math.max(d2.bitmex.XBTUSD.着笔.price.length) - 1 : 
            this.nowChart.indexOf('CTP') !== -1 ? Math.max(this.real.dataExt.ctp.TA909.价格.length, this.real.dataExt.ctp.TA909.盘口.length) - 1 :
                Math.max(d2.hopex.BTCUSDT.价格.length, d2.bitmex.XBTUSD.价格.length, d2.bitmex.XBTUSD.买.盘口.length, d2.bitmex.XBTUSD.卖.盘口.length) - 1


        const left = Math.max(0, right - this.showCount)
        return { left, right }
    }
} 