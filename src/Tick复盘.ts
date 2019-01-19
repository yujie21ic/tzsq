import { chartInit, getIndex } from './lib/Chart'
import { lastNumber } from './lib/F/lastNumber'
import { RealDataBase } from './RealDataServer/RealDataBase'
import { formatDate } from './lib/F/formatDate'
import { DataClient } from './RealDataServer/DataClient'
import { dialog } from './lib/UI/dialog'
import { registerCommand } from './lib/UI/registerCommand'
import { Tick行情____config } from './Tick行情____config'
import { 指标 } from './lib/指标'
import { keys } from 'ramda'

let real = new DataClient.RealData__History()

const 历史模式 = (v: string) => {
    real = new DataClient.RealData__History()
    real.load(new Date(v).getTime())
    real.重新初始化()
}

registerCommand('load', '时间', v => {
    const str = String(v)
    历史模式(str)
})

window.addEventListener('mousedown', e => {
    if (e.button === 0) {
        const d = real.dataExt[nowTickSymbol]
        real.set现货减去(lastNumber(d.现货.价格) - lastNumber(d.期货.价格))
    }
    else if (e.button === 2) {
        dialog.popupMenu([
            ...['涨', '跌', '结束'].map(v => ({
                label: v,
                checked: 指标.配置.type === v,
                onClick: () => {
                    指标.配置.type = v as any
                    指标.配置.startIndex = getIndex()
                }
            })),
            undefined,
            ...keys(real.dataExt).map(v => ({
                label: v,
                checked: v === nowTickSymbol,
                onClick: () => {
                    nowTickSymbol = v
                    real.set现货减去(0)
                }
            })),
            undefined,
            ...[150, 250, 500, 1000, 2000].map(v => ({
                label: v + '秒',
                checked: v === showCount / (1000 / RealDataBase.单位时间),
                onClick: () => showCount = v * (1000 / RealDataBase.单位时间)
            })),
            undefined,
            ...keys(Tick行情____config).map(v => ({
                label: v,
                checked: v === nowChart,
                onClick: () => {
                    nowChart = v
                }
            })),
        ])
    }
})

type TickSymbol = keyof typeof real.dataExt

let showCount = 600
let nowTickSymbol: TickSymbol = 'XBTUSD'
let nowChart = keys(Tick行情____config)[0]

chartInit(({ layer }) => {
    const d = real.dataExt[nowTickSymbol]

    const xxx = lastNumber(d.现货.价格均线) - lastNumber(d.期货.价格均线) //<------------
    if (isNaN(xxx) === false) {
        real.set现货减去(xxx)
    }

    const right = Math.max(d.现货.价格.length, d.期货.价格.length, d.期货.盘口买.length, d.期货.盘口卖.length) - 1
    const left = Math.max(0, right - showCount)

    return {
        title: nowTickSymbol + '  ' + ((right - left) / (1000 / RealDataBase.单位时间)) + '秒',
        startTime: real.data.startTick * RealDataBase.单位时间,
        显示y: v => {
            const time = (real.data.startTick + v) * RealDataBase.单位时间
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
        每一根是: RealDataBase.单位时间,
        left,
        right,
        items: Tick行情____config[nowChart](d, real.dataExt)
    }
})