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


const colorTable = [0x777777, 0xccff00, 0xcc66ff]


theme.右边空白 = 0
const real = new HopexRealKLine()
const timeArr = 指标.map(() => real.kline.length, i => new Date(timeID._60s.toTimestamp(real.kline[i].id)).toLocaleString())

const 开始点竖线: boolean[] = []
let 力度Arr: { 多: ArrayLike<number>, 空: ArrayLike<number>, 净: ArrayLike<number> }[] = []

const 更新力度 = () => {
    力度Arr = []

    for (let index = 0; index < 开始点竖线.length; index++) {
        if (开始点竖线[index] === true) {

            const 多 = 指标.map2({}, (arr: number[]) => {
                const length = real.kline.length
                for (let i = Math.max(0, arr.length - 1); i < length; i++) {
                    const 当前力度 = Math.max(0, real.kline[i].close - real.kline[i].open) //<-------
                    if (i === index) {
                        arr[i] = 当前力度
                    } else {
                        arr[i] = 当前力度 + (i === 0 ? NaN : arr[i - 1])
                    }

                }
            })

            const 空 = 指标.map2({}, (arr: number[]) => {
                const length = real.kline.length
                for (let i = Math.max(0, arr.length - 1); i < length; i++) {
                    const 当前力度 = Math.max(0, real.kline[i].open - real.kline[i].close) //<-------
                    if (i === index) {
                        arr[i] = 当前力度
                    } else {
                        arr[i] = 当前力度 + (i === 0 ? NaN : arr[i - 1])
                    }
                }
            })


            const 净 = 指标.map(() => Math.min(多.length, 空.length), i => 多[i] - 空[i])

            力度Arr.push({ 多, 空, 净 })
        }
    }

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
                    layerList: 力度Arr.map((v, i) =>
                        layer(LineLayer, { data: v.净, color: colorTable[Math.min(colorTable.length - 1, i)] })
                    )
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