import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { style } from 'typestyle'
import { OrderClient } from './OrderServer/OrderClient'
import { config } from './config'
import { JSONRequestError } from './lib/C/JSONRequest'
import { dialog } from './lib/UI/dialog'
import { BaseType } from './lib/BaseType'
import { windowExt } from './windowExt'

const account = config.account![windowExt.accountName]
const { cookie } = account
const orderClient = new OrderClient(account.cookie)
const rpc = OrderClient.rpc.func

const RED = 'rgba(229, 101, 70, 1)'
const GREEN = 'rgba(72, 170, 101, 1)'

const boxButton = style({
    margin: 'auto auto',
    width: '150px',
    height: '36px',
    lineHeight: '36px',
    borderRadius: '2px 2px 2px 2px',
    fontSize: '18px',
    textAlign: 'center',
    cursor: 'pointer',
    $nest: {
        '&:active': {
            boxShadow: '2px 2px 2px #999 inset'
        }
    }
})

class Button extends React.Component<{
    bgColor: string
    text: string
    width?: string
    left: () => Promise<{
        error?: JSONRequestError
        data?: boolean
        msg?: string
    }>
    right?: () => Promise<{
        error?: JSONRequestError
        data?: boolean
        msg?: string
    }>
}, { loading: boolean }> {

    componentWillMount() {
        this.setState({ loading: false })
    }

    callFunc(f: () => Promise<{
        error?: JSONRequestError
        data?: boolean
        msg?: string
    }>) {
        this.setState({ loading: true })
        f().then(({ error, msg, data }) => {
            if (error !== undefined) {
                dialog.showMessageBox({
                    title: error,
                    contentText: msg !== undefined ? msg : '',
                })
            }
            else if (data === false) {
                dialog.showMessageBox({
                    title: '失败',
                    contentText: '',
                })
            }
            this.setState({ loading: false })
        })
    }
    render() {
        return this.state.loading ? '--' : <div
            className={boxButton}
            style={{
                backgroundColor: this.props.bgColor,
                width: this.props.width,
            }}
            onMouseUp={e => {
                if (e.button === 0) {
                    this.callFunc(this.props.left)
                } else if (e.button === 2) {
                    this.callFunc(this.props.right ? this.props.right : this.props.left)
                }
            }}
        >{this.props.text}</div>
    }
}


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
                style={{ color: 'yellow' }}
                onClick={() => rpc.取消委托({ cookie, orderID: [id] })}
            >
                <span style={{ color: side === 'Sell' ? RED : GREEN }}>{side === 'Sell' ? '-' : '+'}{cumQty}/{orderQty}</span>
                <span>@{price}__{type}</span>
            </a>
        } else {
            return undefined
        }
    }

    get仓位() {
        const { 仓位数量 } = orderClient.jsonSync.rawData.symbol[this.props.symbol]
        return <span style={{ color: 仓位数量 < 0 ? RED : GREEN }}>{仓位数量}</span>
    }

    get均价() {
        const { 开仓均价 } = orderClient.jsonSync.rawData.symbol[this.props.symbol]
        return <span>{开仓均价}</span>
    }

    render() {

        return <div>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'left',
                margin: '20px 0'
            }}>
                <p>{this.props.symbol}</p>
                <Button
                    bgColor={RED}
                    text='市价平仓'
                    left={() => rpc.市价平仓({ cookie, symbol: this.props.symbol })}
                />
                <p>仓位:{this.get仓位()}@{this.get均价()}</p>
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
                            最低_最高: false,
                        })}
                        right={() => rpc.下单({
                            cookie,
                            symbol: this.props.symbol,
                            type: 'taker',
                            side: 'Buy',
                            size: account.交易[this.props.symbol].数量,
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
                            最低_最高: true,
                        })}
                        right={() => rpc.下单({
                            cookie,
                            symbol: this.props.symbol,
                            type: 'taker',
                            side: 'Buy',
                            size: account.交易[this.props.symbol].数量,
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
                            最低_最高: false,
                        })}
                        right={() => rpc.下单({
                            cookie,
                            symbol: this.props.symbol,
                            type: 'taker',
                            side: 'Sell',
                            size: account.交易[this.props.symbol].数量,
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
                            最低_最高: true,
                        })}
                        right={() => rpc.下单({
                            cookie,
                            symbol: this.props.symbol,
                            type: 'taker',
                            side: 'Sell',
                            size: account.交易[this.props.symbol].数量,
                            最低_最高: true,
                        })}
                    />
                    <br />
                </div>
            </div>
        </div >
    }
}



class APP extends React.Component {
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
                width: '350px',
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


ReactDOM.render(<APP />, document.querySelector('#root'))