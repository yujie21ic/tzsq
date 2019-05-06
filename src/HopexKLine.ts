import { chartInit, layer } from './lib/Chart'
import { KLineLayer } from './lib/Chart/Layer/KLineLayer'
import { formatDate } from './lib/F/formatDate'
import { timeID } from './lib/F/timeID'
import { theme } from './lib/Chart/theme'
import { toRange } from './lib/F/toRange'
import { 笔Layer } from './lib/Chart/Layer/笔Layer'
import { get笔Index, get线段 } from './指标/缠中说禅'
import { 线段Layer } from './lib/Chart/Layer/线段Layer'
import { HopexRealKLine } from './lib/____API____/HopexRealKLine'
import { 指标 } from './指标/指标'

theme.右边空白 = 0

const real = new HopexRealKLine()

let S = {
    left: 200,
    right: 300,
}

real.onFirstLoad = () => {
    S = {
        left: Math.max(0, real.kline.length - 100),
        right: real.kline.length,
    }
}

let isDown = false
let startX = 0
let startLeft = 0
let startRight = 0

const timeArr = 指标.map(() => real.kline.length, i => new Date(timeID._60s.toTimestamp(real.kline[i].id)).toLocaleString())

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
        left: S.left,
        right: S.right,
        items: {
            heightList: [1],
            items: [
                {
                    layerList: [
                        layer(KLineLayer, { data: kline }),
                        layer(笔Layer, { data: get笔Index(kline), color: 0xffff00 }),
                        layer(线段Layer, { data: get线段(get笔Index(kline)), color: 0xaa0000 }),
                    ]
                },
            ]
        }
    }
})



const xx = () => {
    const 多出 = 12

    S.left = toRange({ min: -多出, max: real.kline.length - 多出, value: S.left })

    if (S.right <= S.left + 多出) {
        S.right = S.left + 多出
    }

    S.right = toRange({ min: 多出, max: real.kline.length + 多出, value: S.right })
}


window.onmousewheel = (e: any) => {

    const count = S.right - S.left
    const d = e['wheelDelta'] / 120 * (count * 0.05)

    const n = startX / (document.body.clientWidth - theme.RIGHT_WIDTH)


    S.left += d * n
    S.right -= d * (1 - n)

    xx()

    startX = e['clientX']
    startLeft = S.left
    startRight = S.right
}

window.onmousedown = e => {
    if (e.button === 0) {
        isDown = true
        startX = e.clientX
        startLeft = S.left
        startRight = S.right
    }
}

window.onmouseup = e => {
    if (e.button === 0) {
        isDown = false
    }
}

window.onmousemove = e => {
    if (isDown) {
        S.left = startLeft - (startRight - startLeft) * (e.clientX - startX) / (document.body.clientWidth - theme.RIGHT_WIDTH)
        S.right = startRight - (startRight - startLeft) * (e.clientX - startX) / (document.body.clientWidth - theme.RIGHT_WIDTH)
        xx()
    }
} 