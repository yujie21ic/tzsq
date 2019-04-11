import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { _________________TickBase } from './_________________TickBase'
import { theme } from './lib/Chart/theme'
import { OrderClient } from './OrderServer/OrderClient'
import { config } from './config'
import { BaseType } from './lib/BaseType'
import { windowExt } from './windowExt'
import { Button } from './lib/UI/Button'
import { Switch } from '@material-ui/core'
import { HopexHTTP } from './lib/____API____/HopexHTTP'
import { realTickClient, 提醒 } from './实盘__提醒'
import { lastNumber } from './lib/F/lastNumber'
import { FCoinHTTP } from './lib/____API____/FCoinHTTP'

const 市价追高 = 10

const account = config.account![windowExt.accountName]
const { cookie, hopexCookie, fcoinCookie } = account
const orderClient = new OrderClient(account.cookie)
const rpc = OrderClient.rpc.func



const RED = 'rgba(229, 101, 70, 1)'
const GREEN = 'rgba(72, 170, 101, 1)'

const Table = (p: {
    委托列表: BaseType.Order[]
    side: BaseType.Side
    取消f: (id: string) => void
}) =>
    <table style={{
        width: '150px',
        margin: '15px auto',
    }}>
        <tbody>
            {p.委托列表.filter(v => v.side === p.side).map((v, i) =>
                <tr key={v.id}
                    style={{
                        cursor: 'pointer',
                        fontSize: '20px',
                        width: '100%',
                        color:
                            v.type === '限价只减仓' ? 'yellow'
                                : v.type === '止损' ? '#cc66ff'
                                    : p.side === 'Buy' ? 'rgba(72, 170, 101, 1)' : 'rgba(72, 170, 101, 1)'
                    }}
                    onClick={() => p.取消f(v.id)}
                >
                    <td style={{ width: '65%' }}>{v.price}</td>
                    <td style={{ width: '35%' }}>{v.cumQty}/{v.orderQty}</td>
                </tr>
            )}
        </tbody>
    </table>



class Item extends React.Component<{ symbol: 'XBTUSD' | 'Hopex_BTC' | 'Hopex_ETH' | 'FCoin_BTC', 位置: number, 倍数: number }> {

    get仓位() {
        const { 仓位数量, 开仓均价 } = orderClient.jsonSync.rawData.symbol[this.props.symbol]
        if (仓位数量 !== 0) {
            return <span><span style={{ color: 仓位数量 < 0 ? RED : GREEN }}>{String(仓位数量)}</span>@<span>{String(开仓均价)}</span></span>
        } else {
            return undefined
        }
    }

    render() {
        const { 仓位数量, 任务开关 } = orderClient.jsonSync.rawData.symbol[this.props.symbol]
        const 下单数量 = this.props.symbol === 'FCoin_BTC' ? 0.001 : (this.props.symbol === 'XBTUSD' || this.props.symbol === 'Hopex_BTC' ? account.交易.XBTUSD.数量 : account.交易.ETHUSD.数量) * this.props.倍数


        // 
        const 委托列表 = orderClient.jsonSync.rawData.symbol[this.props.symbol].委托列表
        const 委托 = {
            id: '',
            side: '' as BaseType.Side,
            cumQty: 0,      //成交数量
            orderQty: 0,    //委托数量
            price: 0,
        }
        const x = 委托列表.find(v => v.type !== '止损')
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
        const y = 委托列表.find(v => v.type === '止损')
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
                <p style={{ color: this.props.symbol === 'XBTUSD' ? '#cc66ff' : '#aaaa00' }}>{this.props.symbol} {仓位数量 !== 0 && symbol !== 'FCoin_BTC' && symbol !== 'Hopex_BTC' && symbol !== 'Hopex_ETH' ? <a
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
                <p>
                    止损:<Switch checked={任务开关.自动止损} onChange={(e, v) => { rpc.任务_开关({ cookie, symbol: this.props.symbol, 任务名字: '自动止损', value: v }) }} />
                </p>
            </div>

            {
                symbol === 'FCoin_BTC' ?
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
                                left={() => FCoinHTTP.order(fcoinCookie, {
                                    symbol: 'btcusdt',
                                    price: lastNumber(realTickClient.dataExt.XBTUSD.fcoin.买.盘口1价),
                                    side: 'Buy',
                                    size: 下单数量,
                                })}
                                right={() => FCoinHTTP.order(fcoinCookie, {
                                    symbol: 'btcusdt',
                                    price: lastNumber(realTickClient.dataExt.XBTUSD.fcoin.卖.盘口1价) + 市价追高,
                                    side: 'Buy',
                                    size: 下单数量,
                                })}
                            />
                            <Table 委托列表={委托列表} side='Buy' 取消f={id => {
                                FCoinHTTP.cancel(fcoinCookie, id)
                            }} />
                        </div>
                        <div
                            style={{ width: '50%' }}>
                            <Button
                                bgColor={RED}
                                text={-下单数量 + ''}
                                left={() => FCoinHTTP.order(fcoinCookie, {
                                    symbol: 'btcusdt',
                                    price: lastNumber(realTickClient.dataExt.XBTUSD.fcoin.卖.盘口1价),
                                    side: 'Sell',
                                    size: 下单数量,
                                })}
                                right={() => FCoinHTTP.order(fcoinCookie, {
                                    symbol: 'btcusdt',
                                    price: lastNumber(realTickClient.dataExt.XBTUSD.fcoin.买.盘口1价) - 市价追高,
                                    side: 'Sell',
                                    size: 下单数量,
                                })}
                            />
                            <Table 委托列表={委托列表} side='Sell' 取消f={id => {
                                FCoinHTTP.cancel(fcoinCookie, id)
                            }} />
                        </div>
                    </div>
                    : symbol === 'Hopex_BTC' || symbol === 'Hopex_ETH' ?
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
                                    left={() => HopexHTTP.maker(hopexCookie, {
                                        symbol: symbol === 'Hopex_BTC' ? 'BTCUSDT' : 'ETHUSDT',
                                        price: lastNumber(realTickClient.dataExt[symbol === 'Hopex_BTC' ? 'XBTUSD' : 'ETHUSD'].hopex.买.盘口1价),
                                        side: 'Buy',
                                        size: 下单数量,
                                    })}
                                    right={() => HopexHTTP.taker(hopexCookie, {
                                        symbol: symbol === 'Hopex_BTC' ? 'BTCUSDT' : 'ETHUSDT',
                                        side: 'Buy',
                                        size: 下单数量,
                                    })}
                                />
                                <Table 委托列表={委托列表} side='Buy' 取消f={id => {
                                    HopexHTTP.cancel(hopexCookie, { orderID: Number(id), contractCode: symbol === 'Hopex_BTC' ? 'BTCUSDT' : 'ETHUSDT' })
                                }} />
                            </div>
                            <div
                                style={{ width: '50%' }}>
                                <Button
                                    bgColor={RED}
                                    text={-下单数量 + ''}
                                    left={() => HopexHTTP.maker(hopexCookie, {
                                        symbol: symbol === 'Hopex_BTC' ? 'BTCUSDT' : 'ETHUSDT',
                                        price: lastNumber(realTickClient.dataExt[symbol === 'Hopex_BTC' ? 'XBTUSD' : 'ETHUSD'].hopex.卖.盘口1价),
                                        side: 'Sell',
                                        size: 下单数量,
                                    })}
                                    right={() => HopexHTTP.taker(hopexCookie, {
                                        symbol: symbol === 'Hopex_BTC' ? 'BTCUSDT' : 'ETHUSDT',
                                        side: 'Sell',
                                        size: 下单数量,
                                    })}
                                />
                                <Table 委托列表={委托列表} side='Sell' 取消f={id => {
                                    HopexHTTP.cancel(hopexCookie, { orderID: Number(id), contractCode: symbol === 'Hopex_BTC' ? 'BTCUSDT' : 'ETHUSDT' })
                                }} />
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
                                <Table 委托列表={委托列表} side='Buy' 取消f={id => {
                                    rpc.取消委托({ cookie, orderID: [id] })
                                }} />
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
                                <Table 委托列表={委托列表} side='Sell' 取消f={id => {
                                    rpc.取消委托({ cookie, orderID: [id] })
                                }} />
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
                {/* <Item symbol='XBTUSD' 位置={this.位置} 倍数={this.倍数} /> */}
                {/* <Item symbol='Hopex_BTC' 位置={this.位置} 倍数={this.倍数} /> */}
                <Item symbol='FCoin_BTC' 位置={this.位置} 倍数={this.倍数} />
                <Item symbol='Hopex_ETH' 位置={this.位置} 倍数={this.倍数} />
            </div>
    }

}










class Tick行情 extends _________________TickBase {
    title = '实时'
    real = realTickClient

    constructor(element: HTMLElement) {
        super(element, 4)
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