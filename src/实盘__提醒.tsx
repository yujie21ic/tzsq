import * as React from 'react'
import { DataClient } from './RealDataServer/DataClient'
import { speak } from './lib/F/speak'
import { lastNumber } from './lib/F/lastNumber'
import { 指标 } from './指标/指标'
import { mapObjIndexed } from './lib/F/mapObjIndexed'

export const realTickClient = new DataClient.RealData__Client()

export class 提醒 extends React.Component {

    dic: { [key: string]: number } = Object.create(null)

    setAndSpeak(str: string, v: number, f: (v: number) => boolean) {
        this.dic[str] = v
        if (f(v)) {
            speak(`${str}, ${v.toFixed(2)}`, str)
        }
    }

    step = () => {


        //_______________________________布林带提醒_______________________________
        const 上轨 = lastNumber(realTickClient.dataExt.XBTUSD.bitmex._1分钟_.布林带.上轨)
        const 下轨 = lastNumber(realTickClient.dataExt.XBTUSD.bitmex._1分钟_.布林带.下轨)
        const 收盘价 = lastNumber(realTickClient.dataExt.XBTUSD.bitmex._1分钟_.收盘价)

        this.setAndSpeak(
            '收盘价 大于 上轨 ',
            收盘价 - 上轨,
            v => 收盘价 > 上轨
        )

        this.setAndSpeak(
            '收盘价 小于 下轨 ',
            下轨 - 收盘价,
            v => 收盘价 < 下轨
        )

        //________________________________________________________________________

        this.setAndSpeak(
            '追涨提醒',
            0,
            v => lastNumber(realTickClient.dataExt.XBTUSD.bitmex_追涨_提醒) === 1
        )

        this.setAndSpeak(
            '追跌提醒',
            0,
            v => lastNumber(realTickClient.dataExt.XBTUSD.bitmex_追跌_提醒) === 1
        )


        //________________________________________________________________________
        const xxx = realTickClient.get信号灯Type('bitmex')
        this.setAndSpeak(
            'bitmex ' + xxx,
            0,
            v => xxx !== 'none'
        )

        const yyy = realTickClient.get信号灯Type('hopex')
        this.setAndSpeak(
            'hopex ' + yyy,
            0,
            v => yyy !== 'none'
        )

        const volum = realTickClient.get期货多少秒内成交量__万为单位('XBTUSD', 15)
        const 波动率 = 指标.波动率(realTickClient.dataExt.XBTUSD.bitmex.价格, 30, 500)
        this.setAndSpeak(
            '比 特 币 成交量',
            volum,
            v => volum > 200 && lastNumber(波动率) >= 0.1
        )


        this.forceUpdate()
    }

    componentWillMount() {
        const f = () => {
            requestAnimationFrame(f)
            this.step()
        }
        f()
    }

    render() {
        return <div style={{ width: '100%', height: '100%', backgroundColor: 'black' }}>
            <pre style={{ fontSize: 20, color: 'white' }}>
                {JSON.stringify(mapObjIndexed(v => v.toFixed(2), this.dic), undefined, 4)}
            </pre>
        </div>
    }
}
