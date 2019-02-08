import * as React from 'react'
import { OrderClient } from './OrderServer/OrderClient'
import { config } from './config'
import { BaseType } from './lib/BaseType'
import { windowExt } from './windowExt'
import { Button } from './lib/UI/Button'
import { theme } from './lib/Chart/theme'

const account = config.account![windowExt.accountName]
const { cookie } = account
const orderClient = new OrderClient(account.cookie)
const rpc = OrderClient.rpc.func

const RED = 'rgba(229, 101, 70, 1)'
const GREEN = 'rgba(72, 170, 101, 1)'

class Item extends React.Component<{ symbol: BaseType.BitmexSymbol }> {

    get止损() {
        const arr = orderClient.jsonSync.rawData.symbol[this.props.symbol].活动委托.filter(v => v.type === '止损')
        if (arr.length === 1) {
            return arr[0].price
        } else {
            return undefined
        }
    }

    get委托() {
        const arr = orderClient.jsonSync.rawData.symbol[this.props.symbol].活动委托.filter(v => v.type !== '止损')
        if (arr.length === 1) {
            const { id, side, cumQty, orderQty, price, type } = arr[0]
            return <a
                href='#'
                style={{ color: 'white' }}
                onClick={() => rpc.取消委托({ cookie, orderID: [id] })}
            >
                <span style={{ color: side === 'Sell' ? RED : GREEN }}>{cumQty}/{orderQty}</span>
                <span>@{price}{type === '市价触发' ? '市价' : ''}</span>
            </a>
        } else {
            return undefined
        }
    }

    get仓位() {
        const { 仓位数量, 开仓均价 } = orderClient.jsonSync.rawData.symbol[this.props.symbol]
        if (仓位数量 !== 0) {
            return <span><span style={{ color: 仓位数量 < 0 ? RED : GREEN }}>{仓位数量}</span>@<span>{开仓均价}</span></span>
        } else {
            return undefined
        }
    }

    render() {
        const { 仓位数量 } = orderClient.jsonSync.rawData.symbol[this.props.symbol]
        return <div>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'left',
                margin: '20px 0'
            }}>
                <p style={{ color: this.props.symbol === 'XBTUSD' ? '#cc66ff' : '#aaaa00' }}>{this.props.symbol} {仓位数量 !== 0 ? <a
                    href='#'
                    style={{ color: RED }}
                    onClick={() => rpc.市价平仓({ cookie, symbol: this.props.symbol })}
                >市价平仓</a> : undefined} </p>
                <p>仓位:{this.get仓位()}</p>
                <p>止损:{this.get止损()}</p>
                <p>委托:{this.get委托()}</p>
            </div>
            <div style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center'
            }}>
                <div
                    style={{ width: '50%' }}>
                    <Button
                        bgColor={GREEN}
                        text={account.交易[this.props.symbol].数量 + ''}
                        left={() => rpc.下单({
                            cookie,
                            symbol: this.props.symbol,
                            type: 'maker',
                            side: 'Buy',
                            size: account.交易[this.props.symbol].数量,
                            位置: 3,
                            最低_最高: false,
                        })}
                        right={() => rpc.下单({
                            cookie,
                            symbol: this.props.symbol,
                            type: 'taker',
                            side: 'Buy',
                            size: account.交易[this.props.symbol].数量,
                            位置: 3,
                            最低_最高: false,
                        })}
                    />

                    <br />

                    <Button
                        bgColor={GREEN}
                        text={'5秒内最低价'}
                        left={() => rpc.下单({
                            cookie,
                            symbol: this.props.symbol,
                            type: 'maker',
                            side: 'Buy',
                            size: account.交易[this.props.symbol].数量,
                            位置: 3,
                            最低_最高: true,
                        })}
                        right={() => rpc.下单({
                            cookie,
                            symbol: this.props.symbol,
                            type: 'taker',
                            side: 'Buy',
                            size: account.交易[this.props.symbol].数量,
                            位置: 3,
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
                        text={-account.交易[this.props.symbol].数量 + ''}
                        left={() => rpc.下单({
                            cookie,
                            symbol: this.props.symbol,
                            type: 'maker',
                            side: 'Sell',
                            size: account.交易[this.props.symbol].数量,
                            位置: 3,
                            最低_最高: false,
                        })}
                        right={() => rpc.下单({
                            cookie,
                            symbol: this.props.symbol,
                            type: 'taker',
                            side: 'Sell',
                            size: account.交易[this.props.symbol].数量,
                            位置: 3,
                            最低_最高: false,
                        })}
                    />
                    <br />
                    <Button
                        bgColor={RED}
                        text={'5秒内最高价'}
                        left={() => rpc.下单({
                            cookie,
                            symbol: this.props.symbol,
                            type: 'maker',
                            side: 'Sell',
                            size: account.交易[this.props.symbol].数量,
                            位置: 3,
                            最低_最高: true,
                        })}
                        right={() => rpc.下单({
                            cookie,
                            symbol: this.props.symbol,
                            type: 'taker',
                            side: 'Sell',
                            size: account.交易[this.props.symbol].数量,
                            位置: 3,
                            最低_最高: true,
                        })}
                    />
                    <br />
                </div>
            </div>
        </div >
    }
}



export class 交易 extends React.Component {
    componentWillMount() {
        const f = () => {
            requestAnimationFrame(f)
            this.forceUpdate()
        }
        f()
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
                <h3>只做摸顶抄底</h3>
                <hr />
                <Item symbol='XBTUSD' />
                <hr />
                <Item symbol='ETHUSD' />
            </div>
    }

} 