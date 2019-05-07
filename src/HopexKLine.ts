import { chartInit, layer, getIndex } from './lib/Chart'
import { KLineLayer } from './lib/Chart/Layer/KLineLayer'
import { formatDate } from './lib/F/formatDate'
import { timeID } from './lib/F/timeID'
import { theme } from './lib/Chart/theme'
import { toRange } from './lib/F/toRange'
import { HopexRealKLine } from './lib/____API____/HopexRealKLine'
import { 指标 } from './指标/指标'
import { 竖线Layer } from './lib/Chart/Layer/竖线Layer'
import { LineLayer } from './lib/Chart/Layer/LineLayer'

theme.右边空白 = 0

const 买颜色 = 0x0E6655
const 卖颜色 = 0x943126

const real = new HopexRealKLine()
const timeArr = 指标.map(() => real.kline.length, i => new Date(timeID._60s.toTimestamp(real.kline[i].id)).toLocaleString())
const 开始点竖线: boolean[] = []

let 多力度: ArrayLike<number> = []
let 空力度: ArrayLike<number> = []
let 净力度: ArrayLike<number> = []

const 更新力度 = () => {

    多力度 = 指标.map2({}, (arr: number[]) => {

        const length = real.kline.length

        for (let i = Math.max(0, arr.length - 1); i < length; i++) {
            const 当前力度 = Math.max(0, real.kline[i].close - real.kline[i].open)

            if (开始点竖线[i] === true) {
                arr[i] = 当前力度
            } else {
                arr[i] = 当前力度 + (i === 0 ? NaN : arr[i - 1])
            }

        }
    })

    空力度 = 指标.map2({}, (arr: number[]) => {

        const length = real.kline.length

        for (let i = Math.max(0, arr.length - 1); i < length; i++) {
            const 当前力度 = Math.max(0, real.kline[i].open - real.kline[i].close) //<-------

            if (开始点竖线[i] === true) {
                arr[i] = 当前力度
            } else {
                arr[i] = 当前力度 + (i === 0 ? NaN : arr[i - 1])
            }

        }
    })


    净力度 = 指标.map(() => real.kline.length, i => 多力度[i] - 空力度[i])

}


let left = 200
let right = 300
let isDown = false
let startX = 0
let startLeft = 0
let startRight = 0

real.onFirstLoad = () => {
    left = Math.max(0, real.kline.length - 100)
    right = real.kline.length
}

chartInit(60, document.querySelector('#root') as HTMLElement, () => {

    const kline = real.kline

    return {
        title: 'HopexKLine',
        xStrArr: timeArr,
        显示y: v => {
            const time = (kline[0] ? timeID._60s.toTimestamp(kline[0].id) : 0) + v * 1000 * 60
            if (time % (3600000 * 24) === 0) {
                return formatDate(new Date(time), v => `${v.d}号`)
            } else {
                return undefined
            }
        },
        left: left,
        right: right,
        items: {
            heightList: [0.6, 0.4],
            items: [
                {
                    layerList: [
                        layer(竖线Layer, { data: 开始点竖线, color: 0x555522 }),
                        layer(KLineLayer, { data: kline }),
                        //layer(笔Layer, { data: get笔Index(kline), color: 0xffff00 }),
                        //layer(线段Layer, { data: get线段(get笔Index(kline)), color: 0xaa0000 }),
                    ]
                },
                {
                    layerList: [
                        layer(LineLayer, { data: 多力度, color: 买颜色 }),
                        layer(LineLayer, { data: 空力度, color: 卖颜色 }),
                        layer(LineLayer, { data: 净力度, color: 0xffff00 }),
                    ]
                },
            ]
        }
    }
})


const xx = () => {
    const 多出 = 12

    left = toRange({ min: -多出, max: real.kline.length - 多出, value: left })

    if (right <= left + 多出) {
        right = left + 多出
    }

    right = toRange({ min: 多出, max: real.kline.length + 多出, value: right })
}


window.onmousewheel = (e: any) => {

    const count = right - left
    const d = e['wheelDelta'] / 120 * (count * 0.05)

    const n = startX / (document.body.clientWidth - theme.RIGHT_WIDTH)


    left += d * n
    right -= d * (1 - n)

    xx()

    startX = e['clientX']
    startLeft = left
    startRight = right
}

window.onmousedown = e => {
    if (e.button === 0) {
        isDown = true
        startX = e.clientX
        startLeft = left
        startRight = right
    }
    if (e.button === 2) {
        const index = getIndex()
        开始点竖线[index] = !开始点竖线[index]
        更新力度()
    }
}

window.onmouseup = e => {
    if (e.button === 0) {
        isDown = false
    }
}

window.onmousemove = e => {
    if (isDown) {
        left = startLeft - (startRight - startLeft) * (e.clientX - startX) / (document.body.clientWidth - theme.RIGHT_WIDTH)
        right = startRight - (startRight - startLeft) * (e.clientX - startX) / (document.body.clientWidth - theme.RIGHT_WIDTH)
        xx()
    }
}