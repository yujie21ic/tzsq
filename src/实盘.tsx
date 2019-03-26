import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { DataClient } from './RealDataServer/DataClient'
import { TickBase } from './TickBase'
import { theme } from './lib/Chart/theme'
import { speak } from './lib/F/speak'
import { lastNumber } from './lib/F/lastNumber'
import { mapObjIndexed } from './lib/F/mapObjIndexed'
import { OrderClient } from './OrderServer/OrderClient'
import { config } from './config'
import { BaseType } from './lib/BaseType'
import { windowExt } from './windowExt'
import { Button } from './lib/UI/Button'
import { Switch } from '@material-ui/core'
import { 指标 } from './指标/指标'

const realTickClient = new DataClient.RealData__Client()

const account = config.account![windowExt.accountName]
const { cookie } = account
const orderClient = new OrderClient(account.cookie)
const rpc = OrderClient.rpc.func

const RED = 'rgba(229, 101, 70, 1)'
const GREEN = 'rgba(72, 170, 101, 1)'

class Item extends React.Component<{ symbol: 'XBTUSD' | 'Hopex_BTC', 位置: number, 倍数: number }> {

    get仓位() {
        const { 仓位数量, 开仓均价 } = orderClient.jsonSync.rawData.symbol[this.props.symbol]
        if (仓位数量 !== 0) {
            return <span><span style={{ color: 仓位数量 < 0 ? RED : GREEN }}>{仓位数量}</span>@<span>{开仓均价}</span></span>
        } else {
            return undefined
        }
    }

    render() {
        const { 仓位数量, 任务开关 } = orderClient.jsonSync.rawData.symbol[this.props.symbol]
        const 下单数量 = account.交易.XBTUSD.数量 * this.props.倍数


        // 
        const arr = orderClient.jsonSync.rawData.symbol[this.props.symbol].活动委托
        const 委托 = {
            id: '',
            side: '' as BaseType.Side,
            cumQty: 0,      //成交数量
            orderQty: 0,    //委托数量
            price: 0,
        }
        const x = arr.find(v => v.type !== '止损')
        if (x === undefined) {
            委托.id = ''
        } else {
            委托.cumQty = x.cumQty
            委托.id = x.id
            委托.orderQty = x.orderQty
            委托.price = x.price
            委托.side = x.side
        }

        let 止损价格 = 0
        const y = arr.find(v => v.type === '止损')
        if (y === undefined) {
            止损价格 = 0
        } else {
            止损价格 = y.price
        }


        const get止损 = () => {
            if (止损价格 === 0) {
                return undefined
            } else {
                return 止损价格
            }
        }

        const get委托 = () => {
            if (委托.id !== '') {
                const { id, side, cumQty, orderQty, price } = 委托
                return <a
                    href='#'
                    style={{ color: 'white' }}
                    onClick={() => rpc.取消委托({ cookie, orderID: [id] })}
                >
                    <span style={{ color: side === 'Sell' ? RED : GREEN }}>{cumQty}/{orderQty}</span>
                    <span>@{price}</span>
                </a>
            } else {
                return undefined
            }
        }

        const { symbol } = this.props


        return <div>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'left',
            }}>
                <p style={{ color: this.props.symbol === 'XBTUSD' ? '#cc66ff' : '#aaaa00' }}>{this.props.symbol} {仓位数量 !== 0 && symbol !== 'Hopex_BTC' ? <a
                    href='#'
                    style={{ color: RED }}
                    onClick={() => rpc.市价平仓({ cookie, symbol })}
                >市价平仓</a> : undefined} </p>
                <p>仓位:{this.get仓位()}</p>
                <p>止损:{get止损()}</p>
                <p>委托:{get委托()}</p>
                <p>
                    摸顶:<Switch checked={任务开关.自动开仓摸顶} onChange={(e, v) => { rpc.任务_开关({ cookie, symbol: this.props.symbol, 任务名字: '自动开仓摸顶', value: v }) }} />
                    抄底:<Switch checked={任务开关.自动开仓抄底} onChange={(e, v) => { rpc.任务_开关({ cookie, symbol: this.props.symbol, 任务名字: '自动开仓抄底', value: v }) }} />
                </p>
                <p>
                    追涨:<Switch checked={任务开关.自动开仓追涨} onChange={(e, v) => { rpc.任务_开关({ cookie, symbol: this.props.symbol, 任务名字: '自动开仓追涨', value: v }) }} />
                    追跌:<Switch checked={任务开关.自动开仓追跌} onChange={(e, v) => { rpc.任务_开关({ cookie, symbol: this.props.symbol, 任务名字: '自动开仓追跌', value: v }) }} />
                </p>
                <p>
                    止盈波段:<Switch checked={任务开关.自动止盈波段} onChange={(e, v) => { rpc.任务_开关({ cookie, symbol: this.props.symbol, 任务名字: '自动止盈波段', value: v }) }} />
                    推止损:<Switch checked={任务开关.自动推止损} onChange={(e, v) => { rpc.任务_开关({ cookie, symbol: this.props.symbol, 任务名字: '自动推止损', value: v }) }} />
                </p>
            </div>

            {symbol === 'Hopex_BTC' ? null :
                <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center'
                }}>
                    <div
                        style={{ width: '50%' }}>
                        <Button
                            bgColor={GREEN}
                            text={下单数量 + ' 买' + (this.props.位置 + 1)}
                            left={() => rpc.下单({
                                cookie,
                                symbol,
                                type: 'maker',
                                side: 'Buy',
                                size: 下单数量,
                                位置: this.props.位置,
                                最低_最高: false,
                            })}
                            right={() => rpc.下单({
                                cookie,
                                symbol,
                                type: 'taker',
                                side: 'Buy',
                                size: 下单数量,
                                位置: this.props.位置,
                                最低_最高: false,
                            })}
                        />

                        <br />

                        <Button
                            bgColor={GREEN}
                            text={'5秒最低 买' + (this.props.位置 + 1)}
                            left={() => rpc.下单({
                                cookie,
                                symbol,
                                type: 'maker',
                                side: 'Buy',
                                size: 下单数量,
                                位置: this.props.位置,
                                最低_最高: true,
                            })}
                        />
                        <br />
                    </div>

                    <div
                        style={{
                            width: '50%'
                        }}>
                        <Button
                            bgColor={RED}
                            text={-下单数量 + ' 卖' + (this.props.位置 + 1)}
                            left={() => rpc.下单({
                                cookie,
                                symbol,
                                type: 'maker',
                                side: 'Sell',
                                size: 下单数量,
                                位置: this.props.位置,
                                最低_最高: false,
                            })}
                            right={() => rpc.下单({
                                cookie,
                                symbol,
                                type: 'taker',
                                side: 'Sell',
                                size: 下单数量,
                                位置: this.props.位置,
                                最低_最高: false,
                            })}
                        />
                        <br />
                        <Button
                            bgColor={RED}
                            text={'5秒最高 卖' + (this.props.位置 + 1)}
                            left={() => rpc.下单({
                                cookie,
                                symbol,
                                type: 'maker',
                                side: 'Sell',
                                size: 下单数量,
                                位置: this.props.位置,
                                最低_最高: true,
                            })}
                        />
                        <br />
                    </div>
                </div>
            }
        </div >
    }
}



export class 交易 extends React.Component {


    //state
    位置 = 0
    倍数 = 1


    componentWillMount() {


        const f = () => {
            requestAnimationFrame(f)
            this.forceUpdate()
        }
        f()

        window.addEventListener('keydown', e => {
            if (e.keyCode >= 49 && e.keyCode <= 52) {
                this.倍数 = e.keyCode - 48
            }

            if (e.keyCode === 37) {//left
                if (this.位置 > 0) this.位置--
            }

            if (e.keyCode === 39) {//right
                if (this.位置 < 4) this.位置++
            }

        })
    }



    render() {
        return orderClient.isConnected === false ?
            <a href='#' onClick={() => location.reload()}><h1>连接中_点击刷新</h1></a> :
            <div style={{
                backgroundColor: '#24292d',
                margin: 'auto auto',
                width: `${theme.右边空白}px`,
                padding: '10px 5px',
                fontFamily: 'SourceHanSansSC-regular',
                color: 'white',
                fontSize: '24px',
                userSelect: 'none',
                cursor: 'default'
            }}>
                <Item symbol='XBTUSD' 位置={this.位置} 倍数={this.倍数} />
                <Item symbol='Hopex_BTC' 位置={this.位置} 倍数={this.倍数} />
            </div>
    }

}








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
        //const XBTUSD现货 = realTickClient.dataExt.XBTUSD.现货

        const volum = realTickClient.get期货多少秒内成交量__万为单位('XBTUSD', 15)
        const 波动率 = 指标.波动率(realTickClient.dataExt.XBTUSD.bitmex.价格, 30, 500)
        if (volum > 200 && lastNumber(波动率) >= 5) {
            this.setAndSpeak(
                '比 特 币 成交量',
                volum,
                v => true
            )
        }
        // if (XBTUSD现货.价格.length >= 30) {
        //     const 价钱增量 = XBTUSD现货.价格[XBTUSD现货.价格.length - 1] - XBTUSD现货.价格[XBTUSD现货.价格.length - 30]
        //     const 差价均线距离 =
        //         lastNumber(realTickClient.dataExt.XBTUSD.差价) -
        //         lastNumber(realTickClient.dataExt.XBTUSD.差价均线)

        //     if (
        //         (价钱增量 >= 4 && 差价均线距离 <= -3) || //上涨
        //         (价钱增量 <= -4 && 差价均线距离 >= 3)    //下跌
        //     ) {
        //         this.setAndSpeak(
        //             '比 特 币 差价',
        //             差价均线距离,
        //             v => true
        //         )
        //     }
        // }

        // //ETH
        // const ETHUSD现货 = realTickClient.dataExt.ETHUSD.现货
        // if (ETHUSD现货.价格.length >= 30) {
        //     const 价钱增量 = ETHUSD现货.价格[ETHUSD现货.价格.length - 1] - ETHUSD现货.价格[ETHUSD现货.价格.length - 30]
        //     const 差价均线距离 =
        //         lastNumber(realTickClient.dataExt.ETHUSD.差价) -
        //         lastNumber(realTickClient.dataExt.ETHUSD.差价均线)

        //     if (
        //         (价钱增量 >= 8 && 差价均线距离 <= -0.3) || //上涨
        //         (价钱增量 <= -8 && 差价均线距离 >= 0.3)    //下跌
        //     ) {
        //         this.setAndSpeak(
        //             '以 太 坊 差价',
        //             差价均线距离,
        //             v => true
        //         )
        //     }
        // }


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