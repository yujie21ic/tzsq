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
import { formatDate } from './lib/F/formatDate'
import { DBClient } from './DBServer/DBClient'
import { dialog } from './lib/UI/dialog'
import { timeID } from './lib/F/timeID'
import { theme } from './lib/Chart/theme'

let nowSymbol: BaseType.BitmexSymbol = 'ETHUSD'

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
        startTime: 0,//Date.now() - 24 * 60 * 60 * 1000 * 4,
        endTime: Date.now(),
    })).data

    console.log('arr', arr)

    if (arr === undefined) {
        console.log('load error')
        return
    }

    S = {
        ...S,
        left: Math.max(0, arr.length - 100),
        right: arr.length,
        data: arr
    }

}

window.addEventListener('mousedown', e => {
    if (e.button === 2) {
        dialog.popupMenu(
            ['XBTUSD', 'ETHUSD'].map(v =>
                ({
                    label: v,
                    checked: nowSymbol === v,
                    onClick: () => {
                        nowSymbol = v as BaseType.BitmexSymbol
                        load()
                    }
                })
            )
        )
    }
})


let S = {
    data: [] as BaseType.KLine[],
    left: 200,
    right: 300,
}

chartInit(({ layer }) => {
    const arr = S.data
    const klineData = arr

    const { OSC, DIF, DEM } = MACD(arr.map(v => v.close))
    const 成交买 = arr.map(v => -v.buySize)
    const 成交卖 = arr.map(v => v.sellSize)

    return {
        title: nowSymbol,
        startTime: arr[0] ? timeID.oneMinuteIDToTimestamp(arr[0].id) : 0,//<---------------
        显示y: v => {
            const time = (arr[0] ? timeID.oneMinuteIDToTimestamp(arr[0].id) : 0) + v * 1000 * 60
            if (time % (3600000 * 24) === 0) {
                return formatDate(new Date(time), v => `${v.d}号`)
            } else {
                return undefined
            }
        },
        每一根是: 1000 * 60,
        left: S.left,
        right: S.right,
        items: [
            {
                heightPercentage: 0.6,
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
                    layer(BarLayer, { data: 成交买, color: 0x48aa65 }),
                    layer(BarLayer, { data: 成交卖, color: 0xe56546 }),
                ]
            },
            {
                heightPercentage: 0.2,
                layerList: [
                    layer(BarLayer, { data: OSC, color: 0xaaaaaa }),
                    layer(LineLayer, { data: DIF, color: 0xaa0000 }),
                    layer(LineLayer, { data: DEM, color: 0xffff00 }),
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
    S.left = Math.min(S.data.length - 20.5, S.left) //<------------- 

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
    if (e.button === 0) {
        isDown = true
        startX = e.clientX
        startLeft = S.left
        startRight = S.right
        startWidth = startRight - startLeft
    }
}

window.onmouseup = e => {
    if (e.button === 0) {
        isDown = false
    }
}

window.onmousemove = e => {

    if (isDown) {
        let left = startLeft - startWidth * (e.clientX - startX) / (document.body.clientWidth - theme.RIGHT_WIDTH)
        let right = startRight - startWidth * (e.clientX - startX) / (document.body.clientWidth - theme.RIGHT_WIDTH)

        left = Math.min(S.data.length - 20.5, left) //<-------------
        right = Math.max(20.5, right)

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



load()