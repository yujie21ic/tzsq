import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { 交易 } from './交易'

import { DataClient } from './RealDataServer/DataClient'
import { TickBase } from './TickBase'
import { theme } from './lib/Chart/theme'

import { speak } from './lib/C/speak'
import { lastNumber } from './lib/F/lastNumber'
import { mapObjIndexed } from './lib/F/mapObjIndexed'

const realTickClient = new DataClient.RealData__Client() 

export class 提醒 extends React.Component {

    dic: { [key: string]: number } = Object.create(null)

    setAndSpeak(str: string, v: number, f: (v: number) => boolean) {
        this.dic[str] = v
        if (f(v)) {
            speak(`${str}, ${v.toFixed(2)}`, str)
        }
    }

    step = () => {
        // this.setAndSpeak('比 特 币 盘口买', realTickClient.get现货5档盘口总和('btcusdt', 'Buy'), v => v > 100)
        // this.setAndSpeak('比 特 币 盘口卖', realTickClient.get现货5档盘口总和('btcusdt', 'Sell'), v => v > 100)
        // this.setAndSpeak('以 太 坊 盘口买', realTickClient.get现货5档盘口总和('ethusdt', 'Buy'), v => v > 800)
        // this.setAndSpeak('以 太 坊 盘口卖', realTickClient.get现货5档盘口总和('ethusdt', 'Sell'), v => v > 800)
        // this.setAndSpeak('比 特 币 成交量', realTickClient.get现货多少秒内成交量('btcusdt', 30), v => v > 100)
        // this.setAndSpeak('以 太 坊 成交量', realTickClient.get现货多少秒内成交量('ethusdt', 30), v => v > 500)


        //首先需要现货有大的波动，然后期货在跟随现货的过程中，超过了现货
        //期货比现货涨的多，跌的多才提醒


        //BTC
        const XBTUSD现货 = realTickClient.dataExt.XBTUSD.现货

        const volum = realTickClient.get期货多少秒内成交量__万为单位('XBTUSD', 10)
        if (volum > 200) {
            this.setAndSpeak(
                '比 特 币 成交量',
                volum,
                v => true
            )
        }
        if (XBTUSD现货.价格.length >= 30) {
            const 价钱增量 = XBTUSD现货.价格[XBTUSD现货.价格.length - 1] - XBTUSD现货.价格[XBTUSD现货.价格.length - 30]
            const 差价均线距离 =
                lastNumber(realTickClient.dataExt.XBTUSD.差价) -
                lastNumber(realTickClient.dataExt.XBTUSD.差价均线)

            if (
                (价钱增量 >= 4 && 差价均线距离 <= -3) || //上涨
                (价钱增量 <= -4 && 差价均线距离 >= 3)    //下跌
            ) {
                this.setAndSpeak(
                    '比 特 币 差价',
                    差价均线距离,
                    v => true
                )
            }
        }

        //ETH
        const ETHUSD现货 = realTickClient.dataExt.ETHUSD.现货
        if (ETHUSD现货.价格.length >= 30) {
            const 价钱增量 = ETHUSD现货.价格[ETHUSD现货.价格.length - 1] - ETHUSD现货.价格[ETHUSD现货.价格.length - 30]
            const 差价均线距离 =
                lastNumber(realTickClient.dataExt.ETHUSD.差价) -
                lastNumber(realTickClient.dataExt.ETHUSD.差价均线)

            if (
                (价钱增量 >= 8 && 差价均线距离 <= -0.3) || //上涨
                (价钱增量 <= -8 && 差价均线距离 >= 0.3)    //下跌
            ) {
                this.setAndSpeak(
                    '以 太 坊 差价',
                    差价均线距离,
                    v => true
                )
            }
        }


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
            <pre style={{ fontSize: 28, color: 'white' }}>
                {JSON.stringify(mapObjIndexed(v => v.toFixed(2), this.dic), undefined, 4)}
            </pre>
        </div>
    }
}


class Tick行情 extends TickBase {
    title = '实时'
    real = realTickClient

    constructor(element: HTMLElement) {
        super(element)
    }
}

class 实盘 extends React.Component {

    initChart = (element: HTMLElement | null) => {
        if (element !== null) {
            new Tick行情(element)
        }
    }

    render() {
        return <div style={{ display: 'flex', height: '100%' }}>
            <div style={{ flex: '1 1 auto' }} ref={this.initChart} />
            <div style={{ width: `${theme.右边空白}px` }}><交易 /><提醒 /></div>
        </div>
    }
}

ReactDOM.render(<实盘 />, document.querySelector('#root'))