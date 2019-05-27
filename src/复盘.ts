import { chartInit, layer, getIndex } from './Chart'
import { KLineLayer } from './Chart/Layer/KLineLayer'
import { BarLayer } from './Chart/Layer/BarLayer'
import { BaseType } from './BaseType'
import { formatDate } from './F/formatDate'
import { DBClient } from './DataServer/DBClient'
import { dialog } from './UI/dialog'
import { timeID } from './F/timeID'
import { theme } from './Chart/theme'
import { toRange } from './F/toRange'
import { showWindow } from './windowExt'
import { 指标 } from './指标/指标'
import { LineLayer } from './Chart/Layer/LineLayer'

theme.右边空白 = 0


// import { get笔Index, 合并后的K线, get线段 } from './RealDataServer/缠中说禅'
// import { 线段Layer } from './Chart/Layer/线段Layer'
// import { 合并后的Layer } from './Chart/Layer/合并后的Layer'
// import { 笔Layer } from './Chart/Layer/笔Layer'

let nowSymbol: BaseType.BitmexSymbol = 'XBTUSD'

let S = {
    left: 200,
    right: 300,
    data: [] as BaseType.KLine[],
}

let isDown = false
let startX = 0
let startLeft = 0
let startRight = 0





let dif: ArrayLike<number> = []
let dem: ArrayLike<number> = []
let osc: ArrayLike<number> = []
let 时间str: ArrayLike<string> = []

const load = async () => {
    S = {
        left: 0,
        right: 100,
        data: []
    }

    const { data, error, msg } = await DBClient.func.getKLine({
        type: '1m',
        symbol: nowSymbol,
        startTime: Date.now() - 24 * 60 * 60 * 1000 * 40,
        endTime: Date.now(),
    })

    if (data === undefined) {
        console.log('load error', error, msg)
        return
    }

    时间str = 指标.map(() => data.length, i => new Date(timeID._60s.toTimestamp(data[i].id)).toLocaleString())

    const macd = 指标.macd(data.map(v => v.close), 1000)
    dif = macd.DIF
    dem = macd.DEM
    osc = macd.OSC

    S = {
        left: Math.max(0, data.length - 100),
        right: data.length,
        data: data
    }

}

window.addEventListener('mousedown', e => {
    if (e.button === 2) {
        dialog.popupMenu(
            [
                {
                    label: '打开tick图',
                    click: () =>
                        showWindow('Tick复盘', {
                            accountName: '',
                            symbol: nowSymbol,
                            startTime: timeID._60s.toTimestamp(S.data[getIndex()].id),
                        }, true),
                },
                { type: 'separator' },
                ...['XBTUSD', 'ETHUSD'].map(v =>
                    ({
                        label: v,
                        type: 'checkbox' as 'checkbox',
                        checked: nowSymbol === v,
                        click: () => {
                            nowSymbol = v as BaseType.BitmexSymbol
                            load()
                        }
                    })),

            ]
        )
    }
})


chartInit(60, document.querySelector('#root') as HTMLElement, () => {
    const arr = S.data
    const klineData = arr

    const 成交买 = arr.map(v => -v.buySize)
    const 成交卖 = arr.map(v => v.sellSize)

    return { 
        xStrArr: 时间str,
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
            heightList: [0.4, 0.4, 0.2],
            items: [
                {
                    layerList: [
                        layer(KLineLayer, { data: klineData }),
                        // layer(笔Layer, { data: get笔Index(klineData), color: 0xffff00 }),
                        // layer(线段Layer, { data: get线段(get笔Index(klineData)), color: 0xaa0000 }),
                        // layer(合并后的Layer, { data: 合并后的K线(klineData), color: 0xffff00 }),
                    ]
                },
                {
                    layerList: [
                        layer(LineLayer, { data: dif, color: 0xffff00 }),
                        layer(LineLayer, { data: dem, color: 0xaaaa00 }),
                        layer(BarLayer, { data: osc, color: 0xeeeeee }),
                    ]
                },
                {
                    layerList: [
                        layer(BarLayer, { data: 成交买, color: 0x48aa65 }),
                        layer(BarLayer, { data: 成交卖, color: 0xe56546 }),
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