import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { TickBase } from './TickBase'
import { theme } from './lib/Chart/theme'
import { OrderClient } from './OrderServer/OrderClient'
import { config } from './config'
import { BaseType } from './lib/BaseType'
import { windowExt } from './windowExt'
import { Button } from './lib/UI/Button'
import { Switch } from '@material-ui/core'
import { HopexRESTAPI } from './lib/____API____/Hopex/HopexRESTAPI'
import { realTickClient, 提醒 } from './实盘__提醒'


const account = config.account![windowExt.accountName]
const { cookie } = account
const hopexCookie = account.hopexCookie || ''
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

            {symbol === 'Hopex_BTC' ?
                <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center'
                }}>
                    <div
                        style={{ width: '50%' }}>
                        <Button
                            bgColor={GREEN}
                            text={下单数量 + ''}
                            left={() => HopexRESTAPI.taker(hopexCookie, {
                                side: 'Buy',
                                size: 下单数量,
                            })}
                        />
                    </div>
                    <div
                        style={{ width: '50%' }}>
                        <Button
                            bgColor={RED}
                            text={-下单数量 + ''}
                            left={() => HopexRESTAPI.taker(hopexCookie, {
                                side: 'Sell',
                                size: 下单数量,
                            })}
                        />
                    </div>
                </div>

                :
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










class Tick行情 extends TickBase {
    title = '实时'
    real = realTickClient

    constructor(element: HTMLElement) {
        super(element, 20)
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