import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { _________________TickBase } from './_________________TickBase'
import { theme } from './Chart/theme'
import { OrderClient } from './OrderServer/OrderClient'
import { config } from './config'
import { BaseType } from './BaseType'
import { windowExt } from './windowExt'
import { Button } from './UI/Button'
import { HopexHTTP } from './OrderServer/HopexHTTP'
import { realTickClient, 提醒 } from './实盘__提醒'
import { lastNumber } from './F/lastNumber'
import { PositionAndOrder } from './OrderServer/PositionAndOrder'
import { 实盘__任务遥控器 } from './实盘__任务遥控器'

const account = config.account![windowExt.accountName]
const { cookie, hopexCookie } = account
const orderClient = new OrderClient(account.cookie)
const rpc = OrderClient.rpc.func

type XXX = PositionAndOrder['jsonSync']['rawData']['market']['bitmex']['XBTUSD']


const RED = 'rgba(229, 101, 70, 1)'
const GREEN = 'rgba(72, 170, 101, 1)'

export const OrderTable = (p: {
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



class Item extends React.Component<{ market: 'bitmex' | 'hopex', symbol: string, data: () => XXX, 位置: number, 倍数: number }> {

    get仓位() {
        const { 仓位数量, 开仓均价 } = this.props.data()
        if (仓位数量 !== 0) {
            return <span><span style={{ color: 仓位数量 < 0 ? RED : GREEN }}>{String(仓位数量)}</span>@<span>{String(开仓均价)}</span></span>
        } else {
            return undefined
        }
    }

    render() {
        const { 仓位数量 } = this.props.data()
        const 下单数量 = (config.下单数量 || 100) * this.props.倍数
        // 
        const 委托列表 = this.props.data().委托列表
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


        return <div>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'left',
            }}>
                <p style={{ color: '#cc66ff' }}>{this.props.market + '_' + this.props.symbol} {仓位数量 !== 0 && this.props.market === 'bitmex' ? <a
                    href='#'
                    style={{ color: RED }}
                    onClick={() => rpc.市价平仓({ cookie, symbol: this.props.symbol as BaseType.BitmexSymbol })}
                >市价平仓</a> : undefined} </p>
                <p>仓位:{this.get仓位()}</p>
                <p>止损:{get止损()}</p>
                <p>委托:{get委托()}</p>
            </div>

            {
                this.props.market === 'hopex' ?
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
                                    symbol: this.props.symbol as BaseType.HopexSymbol,
                                    price: lastNumber(realTickClient.dataExt.hopex[this.props.symbol as BaseType.HopexSymbol].买.盘口1价),
                                    side: 'Buy',
                                    size: 下单数量,
                                })}
                                right={() => HopexHTTP.taker(hopexCookie, {
                                    symbol: this.props.symbol as BaseType.HopexSymbol,
                                    side: 'Buy',
                                    size: 下单数量,
                                })}
                            />
                            {/* <Table 委托列表={委托列表} side='Buy' 取消f={id => {
                                    HopexHTTP.cancel(hopexCookie, { orderID: Number(id), contractCode: this.props.symbol as BaseType.HopexSymbol })
                                }} /> */}
                        </div>
                        <div
                            style={{ width: '50%' }}>
                            <Button
                                bgColor={RED}
                                text={-下单数量 + ''}
                                left={() => HopexHTTP.maker(hopexCookie, {
                                    symbol: this.props.symbol as BaseType.HopexSymbol,
                                    price: lastNumber(realTickClient.dataExt.hopex[this.props.symbol as BaseType.HopexSymbol].卖.盘口1价),
                                    side: 'Sell',
                                    size: 下单数量,
                                })}
                                right={() => HopexHTTP.taker(hopexCookie, {
                                    symbol: this.props.symbol as BaseType.HopexSymbol,
                                    side: 'Sell',
                                    size: 下单数量,
                                })}
                            />
                            {/* <Table 委托列表={委托列表} side='Sell' 取消f={id => {
                                    HopexHTTP.cancel(hopexCookie, { orderID: Number(id), contractCode: this.props.symbol as BaseType.HopexSymbol })
                                }} /> */}
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
                                    symbol: this.props.symbol as BaseType.BitmexSymbol,
                                    type: 'maker',
                                    side: 'Buy',
                                    size: 下单数量,
                                    位置: this.props.位置,
                                    最低_最高: false,
                                })}
                                right={() => rpc.下单({
                                    cookie,
                                    symbol: this.props.symbol as BaseType.BitmexSymbol,
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
                                    symbol: this.props.symbol as BaseType.BitmexSymbol,
                                    type: 'maker',
                                    side: 'Buy',
                                    size: 下单数量,
                                    位置: this.props.位置,
                                    最低_最高: true,
                                })}
                            />
                            {/* <Table 委托列表={委托列表} side='Buy' 取消f={id => {
                                    rpc.取消委托({ cookie, orderID: [id] })
                                }} /> */}
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
                                    symbol: this.props.symbol as BaseType.BitmexSymbol,
                                    type: 'maker',
                                    side: 'Sell',
                                    size: 下单数量,
                                    位置: this.props.位置,
                                    最低_最高: false,
                                })}
                                right={() => rpc.下单({
                                    cookie,
                                    symbol: this.props.symbol as BaseType.BitmexSymbol,
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
                                    symbol: this.props.symbol as BaseType.BitmexSymbol,
                                    type: 'maker',
                                    side: 'Sell',
                                    size: 下单数量,
                                    位置: this.props.位置,
                                    最低_最高: true,
                                })}
                            />
                            {/* <Table 委托列表={委托列表} side='Sell' 取消f={id => {
                                    rpc.取消委托({ cookie, orderID: [id] })
                                }} /> */}
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

            if (e.keyCode === 112) this.选项卡 = 1
            if (e.keyCode === 113) this.选项卡 = 2


            if (e.keyCode >= 49 && e.keyCode <= 52) {
                this.倍数 = e.keyCode - 48
            }

            if (e.keyCode === 192) {
                this.倍数 = 0.5
            }


            if (e.keyCode === 65) {// a left
                if (this.位置 > 0) this.位置--
            }

            if (e.keyCode === 68) {//d right
                if (this.位置 < 4) this.位置++
            }

        })
    }


    选项卡 = 1

    render() {
        return <div style={{ backgroundColor: '#24292d' }}>

            <div hidden={orderClient.isConnected}>
                <a style={{ fontSize: 16, color: '#666666' }} href='#' onClick={() => location.reload()}><h1>连接中_点击刷新</h1></a>
            </div>

            <div hidden={this.选项卡 !== 1}
                style={{
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
                <Item market='bitmex' symbol='XBTUSD' data={() => orderClient.jsonSync.rawData.market.bitmex.XBTUSD} 位置={this.位置} 倍数={this.倍数} />
                <Item market='bitmex' symbol='ETHUSD' data={() => orderClient.jsonSync.rawData.market.bitmex.ETHUSD} 位置={this.位置} 倍数={this.倍数} />
                {/* <Item market='hopex' symbol='BTCUSDT' data={() => orderClient.jsonSync.rawData.market.hopex.BTCUSDT} 位置={this.位置} 倍数={this.倍数} /> */}
                <实盘__任务遥控器 />
            </div>

            <div hidden={this.选项卡 !== 2}>
                <提醒 />
            </div>

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
            <div style={{ width: `${theme.右边空白}px` }}><交易 /></div>
        </div>
    }
}

ReactDOM.render(<实盘 />, document.querySelector('#root'))