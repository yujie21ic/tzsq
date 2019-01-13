import { chartInit, getIndex } from './lib/Chart'
import { lastNumber } from './lib/F/lastNumber'
import { RealDataBase } from './RealDataServer/RealDataBase'
import { formatDate } from './lib/F/formatDate'
import { DataClient } from './RealDataServer/DataClient'
import { dialog } from './lib/UI/dialog'
import { registerCommand } from './lib/UI/registerCommand'
import { Tick行情____config } from './Tick行情____config'
import { 指标 } from './lib/指标'


const realTickClient = new DataClient.RealData__Client()


let real: RealDataBase = realTickClient
let realTickHistory: DataClient.RealData__History

const 实时模式 = () => real = realTickClient

const 历史模式 = (v: string) => {
    realTickHistory = new DataClient.RealData__History()
    realTickHistory.load(new Date(v).getTime())
    realTickHistory.默认期货波动率 = realTickClient.默认期货波动率
    realTickHistory.重新初始化()
    real = realTickHistory
}

const 设置波动率 = (v: string) => {
    const n = Number(v)
    realTickClient.默认期货波动率 = n
    realTickClient.重新初始化()
    if (realTickHistory !== undefined) {
        realTickHistory.默认期货波动率 = realTickClient.默认期货波动率
        realTickHistory.重新初始化()
    }
}

registerCommand('load', '时间', v => {
    const str = String(v)
    if (str === '') {
        实时模式()
    } else {
        历史模式(str)
    }
})

registerCommand('bdl', '波动率', 设置波动率)

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
            ...Object.keys(real.dataExt).map(v => ({
                label: v,
                checked: v === nowTickSymbol,
                onClick: () => {
                    nowTickSymbol = v as TickSymbol
                    real.set现货减去(0)
                }
            })),
            undefined,
            ...[250, 500, 1000, 2000].map(v => ({
                label: v + '秒',
                checked: v === showCount / (1000 / RealDataBase.单位时间),
                onClick: () => showCount = v * (1000 / RealDataBase.单位时间)
            })),
            undefined,
            {
                label: '历史模式',
                onClick: () => dialog.showInput({
                    type: 'date',
                    title: '设置时间',
                    value: new Date().toISOString(),
                    onOK: 历史模式,
                })
            },
            {
                label: '实时模式',
                onClick: 实时模式,
            },
            {
                label: '设置波动率',
                onClick: () => dialog.showInput({
                    type: 'text',
                    title: '设置波动率',
                    value: realTickClient.默认期货波动率 + '',
                    onOK: 设置波动率,
                })
            },
            undefined,
            ...Object.keys(Tick行情____config).map(v => ({
                label: v,
                checked: v === nowChart,
                onClick: () => {
                    nowChart = v as TickSymbol
                }
            })),
        ])
    }
})

type TickSymbol = keyof typeof real.dataExt

let showCount = 600
let nowTickSymbol: TickSymbol = 'XBTUSD'
let nowChart = Object.keys(Tick行情____config)[0]

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
        items: Tick行情____config[nowChart](d)
    }
})