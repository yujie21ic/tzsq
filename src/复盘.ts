import { chartInit, layer, getIndex } from './lib/Chart'
import { KLineLayer } from './lib/Chart/Layer/KLineLayer'
import { BarLayer } from './lib/Chart/Layer/BarLayer'
import { BaseType } from './lib/BaseType'
import { formatDate } from './lib/F/formatDate'
import { DBClient } from './DBServer/DBClient'
import { dialog } from './lib/UI/dialog'
import { timeID } from './lib/F/timeID'
import { theme } from './lib/Chart/theme'
import { to范围 } from './lib/F/to范围'
import { showWindowRemote, windowExt } from './windowExt'
import { BitMEXRESTAPI } from './lib/BitMEX/BitMEXRESTAPI'
import { config } from './config'
import { 信号Layer } from './lib/Chart/Layer/信号Layer';

theme.右边空白 = 0


// import { get笔Index, 合并后的K线, get线段 } from './lib/缠中说禅'
// import { 线段Layer } from './lib/Chart/Layer/线段Layer'
// import { 合并后的Layer } from './lib/Chart/Layer/合并后的Layer'
// import { LineLayer } from './lib/Chart/Layer/LineLayer'
// import { 笔Layer } from './lib/Chart/Layer/笔Layer'

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



const account = config.account![windowExt.accountName]
const { cookie } = account

let 止损1m_dic: { [key: number]: string } = Object.create(null)
let 止损提示: { name: string, value: boolean }[][] = []

const load = async () => {
    S = {
        left: 0,
        right: 100,
        data: []
    }

    const { data, error, msg } = await DBClient.func.getKLine({
        type: '1m',
        symbol: nowSymbol,
        startTime: Date.now() - 24 * 60 * 60 * 1000 * 20,
        endTime: Date.now(),
    })

    if (data === undefined) {
        console.log('load error', error, msg)
        return
    }

    S = {
        left: Math.max(0, data.length - 100),
        right: data.length,
        data: data
    }


    const res = await BitMEXRESTAPI.Execution.getTradeHistory(cookie, {
        reverse: true,
        count: 500,
        filter: JSON.stringify({ 'symbol': nowSymbol }),
        columns: JSON.stringify([]),
    })


    if (res.data !== undefined) {
        console.log(res.data)
        res.data.filter(v => v.ordType === 'Stop' || v.ordType === 'StopLimit').forEach(v =>
            止损1m_dic[timeID.timestampToOneMinuteID(new Date(v.transactTime).getTime())] = v.ordType
        )
    }


    止损提示 = data.map(v => [
        { name: '止损', value: 止损1m_dic[v.id] === 'Stop' },
        { name: '强平', value: 止损1m_dic[v.id] === 'StopLimit' },
    ])

}

window.addEventListener('mousedown', e => {
    if (e.button === 2) {
        dialog.popupMenu(
            [
                {
                    label: '打开tick图',
                    onClick: () =>
                        showWindowRemote('Tick复盘', {
                            accountName: '',
                            symbol: nowSymbol,
                            startTime: timeID.oneMinuteIDToTimestamp(S.data[getIndex()].id),
                        }, true),
                },
                undefined,
                ...['XBTUSD', 'ETHUSD'].map(v =>
                    ({
                        label: v,
                        checked: nowSymbol === v,
                        onClick: () => {
                            nowSymbol = v as BaseType.BitmexSymbol
                            load()
                        }
                    })),

            ]
        )
    }
})


chartInit(document.querySelector('#root') as HTMLElement, () => {
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
        items: {
            heightList: [0.6, 0.2, 0.2],
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
                        layer(信号Layer, { data: 止损提示, color: 0xe56546 }),
                    ]
                },
                {
                    layerList: [
                        layer(BarLayer, { data: 成交买, color: 0x48aa65 }),
                        layer(BarLayer, { data: 成交卖, color: 0xe56546 }),
                    ]
                },
                // {
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
    }
})


const xx = () => {
    const 多出 = 12

    S.left = to范围({ min: -多出, max: S.data.length - 多出, value: S.left })

    if (S.right <= S.left + 多出) {
        S.right = S.left + 多出
    }

    S.right = to范围({ min: 多出, max: S.data.length + 多出, value: S.right })
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