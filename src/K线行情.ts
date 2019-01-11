import { chartInit } from './lib/Chart'
import { KLineLayer } from './lib/Chart/Layer/KLineLayer'
import { get笔Index, 合并后的K线, get线段 } from './lib/缠中说禅'
import { 线段Layer } from './lib/Chart/Layer/线段Layer'
import { 合并后的Layer } from './lib/Chart/Layer/合并后的Layer'
import { LineLayer } from './lib/Chart/Layer/LineLayer'
import { 笔Layer } from './lib/Chart/Layer/笔Layer'
import { BarLayer } from './lib/Chart/Layer/BarLayer'
import { BaseType } from './lib/BaseType'
import { MACD } from './lib/指标/MACD'
import { TextLayer } from './lib/Chart/Layer/TextLayer'
import { lastNumber } from './lib/F/lastNumber'
import { formatDate } from './lib/F/formatDate'
import { DBClient } from './DBServer/DBClient'
import { dialog } from './lib/UI/dialog'
import { timeID } from './lib/F/timeID'

let nowSymbol: BaseType.BinanceSymbol = 'ethusdt'

const load = async () => {
    S = {
        ...S,
        left: 0,
        right: 100,
        data: []
    }

    const arr = (await DBClient.func.getKLine({
        type: '1m',
        symbol: nowSymbol,
        startTime: Date.now() - 24 * 60 * 60 * 1000 * 4,
        endTime: Date.now(),
    })).data
    if (arr === undefined) {
        console.log('load error')
        return
    }

    S = {
        ...S,
        left: Math.max(0, arr.length - 20),
        right: arr.length,
        data: arr
    }

}

window.addEventListener('mousedown', e => {
    if (e.button === 2) {
        dialog.popupMenu(
            ['btcusdt', 'ethusdt'].map(v =>
                ({
                    label: v,
                    checked: nowSymbol === v,
                    onClick: () => {
                        nowSymbol = v as BaseType.BinanceSymbol
                        load()
                    }
                })
            )
        )
    }
})


let S = {
    data: [] as {
        id: number //<---------------------------
        open: number
        high: number
        low: number
        close: number
        buySize: number
        sellSize: number
        buyCount: number
        sellCount: number
    }[],
    left: 200,
    right: 300,
}

chartInit(({ layer }) => {
    const arr = S.data
    const klineData = arr
    const xxx = MACD(arr.map(v => v.close))
    const OBV = [] as number[]
    for (let i = 0; i < arr.length; i++) {
        OBV[i] = (i === 0 ? 0 : OBV[i - 1]) + arr[i].buySize - arr[i].sellSize
    }

    //5____没显示
    const 成交速度_买 = arr.map(v => -v.buyCount)
    const 成交速度_卖 = arr.map(v => v.sellCount)

    return {
        title: nowSymbol,
        startTime: arr[0] ? timeID.oneMinuteIDToTimestamp(arr[0].id) : 0,//<---------------
        显示y: v => {
            const time = (arr[0] ? timeID.oneMinuteIDToTimestamp(arr[0].id) : 0) + v * 1000 * 60
            if (time % 3600000 === 0) {
                return formatDate(new Date(time), v => `${v.hh}:${v.mm}`)
            } else {
                return undefined
            }
        },
        每一根是: 1000 * 60,
        left: S.left,
        right: S.right,
        items: [
            {
                heightPercentage: 0.4,
                layerList: [
                    layer(KLineLayer, { data: klineData }),
                    layer(笔Layer, { data: get笔Index(klineData), color: 0xffff00 }),
                    layer(线段Layer, { data: get线段(get笔Index(klineData)), color: 0xaa0000 }),
                    layer(合并后的Layer, { data: 合并后的K线(klineData), color: 0xffff00 }),
                    layer(TextLayer, { text: '', color: 0xffffff }),
                ]
            },
            {
                heightPercentage: 0.2,
                layerList: [
                    layer(LineLayer, { data: OBV, color: 0xffff00 }),
                    layer(TextLayer, { text: '', color: 0xffffff }),
                ]
            },
            {
                heightPercentage: 0.2,
                layerList: [
                    layer(BarLayer, { data: 成交速度_买, color: 0x48aa65 }),
                    layer(BarLayer, { data: 成交速度_卖, color: 0xe56546 }),
                    layer(TextLayer, {
                        text: `现货 买笔数:${lastNumber(成交速度_买)}  卖笔数:${lastNumber(成交速度_卖)}`,
                        color: 0xffffff
                    })
                ]
            },
            {
                heightPercentage: 0.2,
                layerList: [
                    layer(BarLayer, { data: xxx.OSC, color: 0xaaaaaa }),
                    layer(LineLayer, { data: xxx.DIF, color: 0xaa0000 }),
                    layer(LineLayer, { data: xxx.DEM, color: 0xffff00 }),
                    layer(TextLayer, {
                        text: '',
                        color: 0xffffff
                    })
                ]
            },
        ]
    }
})

window.onmousewheel = (e: any) => {
    S = {
        ...S,
        left: Math.floor(S.left + e['wheelDelta'] / 120 * (S.right - S.left) * 0.05)
    }
    startX = e['clientX']
    startLeft = S.left
    startRight = S.right
    startWidth = startRight - startLeft
}

//左右移动
let isDown = false
let startLeft = 0
let startRight = 0
let startX = 0
let startWidth = 0

window.onmousedown = e => {
    isDown = true
    startX = e.clientX
    startLeft = S.left
    startRight = S.right
    startWidth = startRight - startLeft
}

window.onmousemove = e => {

    if (isDown) {
        const left = startLeft - startWidth * (e.clientX - startX) / document.body.clientWidth
        const right = startRight - startWidth * (e.clientX - startX) / document.body.clientWidth
        S = {
            ...S,
            left,
            right
        }
    } else {
        S = {
            ...S,
        }
    }
}

window.onmouseup = e => isDown = false

load()