import { chartInit, layer } from './lib/Chart'
import { KLineLayer } from './lib/Chart/Layer/KLineLayer'
import { formatDate } from './lib/F/formatDate'
import { timeID } from './lib/F/timeID'
import { theme } from './lib/Chart/theme'
import { toRange } from './lib/F/toRange'
import { 指标 } from './指标/指标'
import { JSONRequest } from './lib/F/JSONRequest'
import { 笔Layer } from './lib/Chart/Layer/笔Layer'
import { get笔Index, get线段 } from './指标/缠中说禅'
import { 线段Layer } from './lib/Chart/Layer/线段Layer'
import { queryStringStringify } from './lib/F/queryStringStringify'

theme.右边空白 = 0

type KL = {
    id: number
    open: number
    high: number
    low: number
    close: number
}

class Real {

    时间str: ArrayLike<string> = []
    kline: ArrayLike<KL> = []

    load = async () => {

        const { data, error, msg } = await JSONRequest<{ data: string[][] }>({
            url: 'https://web.hopex.com/api/v1/gateway/Home/KLines?' + queryStringStringify({
                startTime: toS(Date.now() - (1000 * 60 * 60 * 24)),
                endTime: toS(Date.now() + 1000 * 60),
                interval: 60,
                market: 'BTCUSD',
                marketCode: 'BTCUSD',
                contractCode: 'BTCUSD',
            }),
            method: 'GET',
            ss: false,
        })

        if (data === undefined) {
            console.log('load error', error, msg)
            return
        }

        const arr = data.data

        this.时间str = 指标.map(() => arr.length, i => new Date(Number(arr[i][0]) * 1000).toLocaleString())

        this.kline = arr.map(v => ({
            id: timeID._60s.toID(Number(v[0]) * 1000),
            open: Number(v[1]),
            high: Number(v[3]),
            low: Number(v[4]),
            close: Number(v[2]),
            buySize: 0,
            sellSize: 0,
            buyCount: 0,
            sellCount: 0,
        }))
    }
}



const real = new Real()

let S = {
    left: 200,
    right: 300,
    data: [] as ArrayLike<KL>,
}

let isDown = false
let startX = 0
let startLeft = 0
let startRight = 0

const toS = (n: number) => Math.floor(n / 1000)

const load = async () => {
    S = {
        left: 0,
        right: 100,
        data: []
    }

    await real.load()

    S = {
        left: Math.max(0, real.kline.length - 100),
        right: real.kline.length,
        data: real.kline,
    }
}

chartInit(60, document.querySelector('#root') as HTMLElement, () => {
    const arr = S.data
    const klineData = arr

    return {
        title: 'HopexKLine',
        xStrArr: real.时间str,
        显示y: v => {
            const time = (arr[0] ? timeID._60s.toTimestamp(arr[0].id) : 0) + v * 1000 * 60
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
                        layer(KLineLayer, { data: klineData }),
                        layer(笔Layer, { data: get笔Index(klineData), color: 0xffff00 }),
                        layer(线段Layer, { data: get线段(get笔Index(klineData)), color: 0xaa0000 }),
                    ]
                },

            ]
        }
    }
})



const xx = () => {
    const 多出 = 12

    S.left = toRange({ min: -多出, max: S.data.length - 多出, value: S.left })

    if (S.right <= S.left + 多出) {
        S.right = S.left + 多出
    }

    S.right = toRange({ min: 多出, max: S.data.length + 多出, value: S.right })
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

load()