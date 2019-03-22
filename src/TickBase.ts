import { chartInit } from './lib/Chart'
import { lastNumber } from './lib/F/lastNumber'
import { RealDataBase } from './RealDataServer/RealDataBase'
import { formatDate } from './lib/F/formatDate'
import { dialog } from './lib/UI/dialog'
import { Tick行情____config } from './Tick行情____config'
import { keys } from 'ramda'
import { BaseType } from './lib/BaseType'


const 显示秒 = [250, 50, 150, 500, 1000, 2000, 3600, 20000]

export class TickBase {

    real = new RealDataBase()
    showCount = 显示秒[0] * (1000 / RealDataBase.单位时间)
    nowTickSymbol: BaseType.BitmexSymbol = 'XBTUSD'
    nowChart = keys(Tick行情____config)[0]

    constructor(element: HTMLElement) {

        window.addEventListener('mousedown', e => {
            if (e.button === 0) {
            }
            else if (e.button === 2) {
                dialog.popupMenu([
                    ...keys(this.real.dataExt).map(v => ({
                        label: v,
                        checked: v === this.nowTickSymbol,
                        onClick: () => {

                        }
                    })),
                    undefined,
                    ...显示秒.map(v => ({
                        label: v + '秒',
                        checked: v === this.showCount / (1000 / RealDataBase.单位时间),
                        onClick: () => this.showCount = v * (1000 / RealDataBase.单位时间)
                    })),
                    undefined,
                    ...keys(Tick行情____config).map(v => ({
                        label: v,
                        checked: v === this.nowChart,
                        onClick: () => {
                            this.nowChart = v
                        }
                    })),
                ])
            }
        })



        chartInit(element, () => {
            const d = this.real.dataExt[this.nowTickSymbol]

            const { left, right } = this.getLeftRight()

            return {
                title: this.title + ' ' + this.nowTickSymbol + '  ' + ((right - left) / (1000 / RealDataBase.单位时间)) + '秒',
                xStrArr: this.nowChart === '波动_测试' ? d.期货.波动_测试_时间str : d.期货.时间str,
                显示y: v => {
                    if (this.nowChart === '波动_测试') return undefined

                    const time = (this.real.data.startTick + v) * RealDataBase.单位时间
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
                items: Tick行情____config[this.nowChart](d, this.real.dataExt)
            }
        })
    }

    title = ''

    getLeftRight() {
        const d = this.real.dataExt[this.nowTickSymbol]

        const right = this.nowChart === '波动_测试' ?
            Math.max(d.期货.波动_测试_累计买.length) - 1 :
            Math.max(d.现货.价格.length, d.hopex.价格.length, d.期货.价格.length, d.期货.买.盘口.length, d.期货.卖.盘口.length) - 1

        const left = Math.max(0, right - this.showCount)
        return { left, right }
    }
} 