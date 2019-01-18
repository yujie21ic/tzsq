import { chartInit } from './lib/Chart'
import { KLineLayer } from './lib/Chart/Layer/KLineLayer'
import { BarLayer } from './lib/Chart/Layer/BarLayer'
import { BaseType } from './lib/BaseType'
import { formatDate } from './lib/F/formatDate'
import { DBClient } from './DBServer/DBClient'
import { dialog } from './lib/UI/dialog'
import { timeID } from './lib/F/timeID'
import { theme } from './lib/Chart/theme'

// import { MACD } from './lib/指标/MACD' 

// import { get笔Index, 合并后的K线, get线段 } from './lib/缠中说禅'
// import { 线段Layer } from './lib/Chart/Layer/线段Layer'
// import { 合并后的Layer } from './lib/Chart/Layer/合并后的Layer'
// import { LineLayer } from './lib/Chart/Layer/LineLayer'
// import { 笔Layer } from './lib/Chart/Layer/笔Layer'

let nowSymbol: BaseType.BitmexSymbol = 'ETHUSD'

let S = {
    left: 200,
    right: 300,
    data: [] as BaseType.KLine[],
}

let isDown = false
let startX = 0
let startLeft = 0
let startRight = 0




const load = async () => {
    S = {
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

    console.log('arr', arr)

    if (arr === undefined) {
        console.log('load error')
        return
    }

    S = {
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


chartInit(({ layer }) => {
    const arr = S.data
    const klineData = arr

    // const { OSC, DIF, DEM } = MACD(arr.map(v => v.close))
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
                    // layer(笔Layer, { data: get笔Index(klineData), color: 0xffff00 }),
                    // layer(线段Layer, { data: get线段(get笔Index(klineData)), color: 0xaa0000 }),
                    // layer(合并后的Layer, { data: 合并后的K线(klineData), color: 0xffff00 }),                    
                ]
            },
            {
                heightPercentage: 0.4,
                layerList: [
                    layer(BarLayer, { data: 成交买, color: 0x48aa65 }),
                    layer(BarLayer, { data: 成交卖, color: 0xe56546 }),
                ]
            },
            // {
            //     heightPercentage: 0.2,
            //     layerList: [
            //         layer(BarLayer, { data: OSC, color: 0xaaaaaa }),
            //         layer(LineLayer, { data: DIF, color: 0xaa0000 }),
            //         layer(LineLayer, { data: DEM, color: 0xffff00 }),
            //         layer(TextLayer, {
            //             text: '',
            //             color: 0xffffff
            //         })
            //     ]
            // },
        ]
    }
})

window.onmousewheel = (e: any) => {

    const count = S.right - S.left
    const d = e['wheelDelta'] / 120 * count
    const n = startX / (document.body.clientWidth - theme.RIGHT_WIDTH)


    S.left += d * n
    S.right -= d * (1 - n)


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
        const left = startLeft - (startRight - startLeft) * (e.clientX - startX) / (document.body.clientWidth - theme.RIGHT_WIDTH)
        const right = startRight - (startRight - startLeft) * (e.clientX - startX) / (document.body.clientWidth - theme.RIGHT_WIDTH)
        S.left = Math.min(S.data.length - 20.5, left) //<-------------
        S.right = Math.max(20.5, right)
    }
}



load()