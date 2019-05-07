import { chartInit, layer, getIndex } from './lib/Chart'
import { KLineLayer } from './lib/Chart/Layer/KLineLayer'
import { formatDate } from './lib/F/formatDate'
import { timeID } from './lib/F/timeID'
import { theme } from './lib/Chart/theme'
import { toRange } from './lib/F/toRange'
import { HopexRealKLine } from './lib/____API____/HopexRealKLine'
import { 指标 } from './指标/指标'
import { 竖线Layer } from './lib/Chart/Layer/竖线Layer'


const colorTable = [0x777777, 0xccff00, 0xcc66ff]


theme.右边空白 = 0
const real = new HopexRealKLine()
const timeArr = 指标.map(() => real.kline.length, i => new Date(timeID._60s.toTimestamp(real.kline[i].id)).toLocaleString())

let 多力度: ArrayLike<number> = []
let 空力度: ArrayLike<number> = []
let 净力度: ArrayLike<number> = []
const 开始点竖线: boolean[] = []

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


    净力度 = 指标.map(() => Math.min(多力度.length, 空力度.length), i => 多力度[i] - 空力度[i])

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
                        layer(力度对比Layer, { 多力度, 空力度, 净力度, 开始点竖线 }),
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



import { Graphics } from 'pixi.js'
import { Layer } from './lib/Chart/Layer/Layer'
import { Viewport, To, TopBottom } from './lib/Chart/type'
import { getTopAndBottom } from './lib/Chart/getTopAndBottom'
import { combineTopAndBottom } from './lib/Chart/combineTopAndBottom'

export class 力度对比Layer extends Layer<{
    多力度: ArrayLike<number>
    空力度: ArrayLike<number>
    净力度: ArrayLike<number>
    开始点竖线: boolean[]
}> {

    private g = new Graphics()

    init() {
        this.addChild(this.g)
    }

    render(viewport: Viewport, to: To, tb: TopBottom) {
        const { g } = this
        g.clear()

        const { 多力度, 空力度, 净力度 } = this.props
        const arr: { 多: number[], 空: number[], 净: number[] }[] = []

        for (let i = 0; i < 净力度.length; i++) {
            if (开始点竖线[i] === true) {
                arr.push({ 多: [], 空: [], 净: [] })
            }
            if (arr.length > 0) {
                arr[arr.length - 1].多.push(多力度[i])
                arr[arr.length - 1].空.push(空力度[i])
                arr[arr.length - 1].净.push(净力度[i])
            }
        }

        let length = 0
        arr.forEach(v => length = Math.max(length, v.净.length))
        arr.forEach((v, i) => {
            const data = v.净

            g.lineStyle(1, colorTable[Math.min(colorTable.length - 1, i)])

            let hasMove = false

            for (let i = 0; i < length; i++) {
                const v = data[i]

                if (isNaN(v)) {
                    hasMove = false
                    continue
                }
                const x = viewport.width / length * i
                const y = to.y(v)

                if (hasMove === false) {
                    hasMove = true
                    g.moveTo(x, y)
                } else {
                    g.lineTo(x, y)
                }
            }
        })
    }

    getRight() {
        return this.props.净力度.length - 1
    }

    updateTopAndBottom = (viewport: Viewport, tb: TopBottom) => {
        const xx = getTopAndBottom(this.props.净力度)({ ...viewport, left: 0, right: this.props.净力度.length - 1 })
        return combineTopAndBottom(tb, xx)
    }

} 