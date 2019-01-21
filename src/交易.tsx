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
let nowSymbol: BaseType.BitmexSymbol = 'XBTUSD'
const d = () => orderClient.jsonSync.rawData.symbol[nowSymbol]

const rpc = OrderClient.rpc.func

    ; (window as any)['d'] = d


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


class Table extends React.Component<{

    side: string

}, {}> {

    componentWillMount() {

    }
    render() {
        return <table style={{
            width: '150px',
            margin: '15px auto',
        }}
        >
            <tbody>
                {d().活动委托.filter(v => v.side === this.props.side).map((v, i) =>
                    <tr key={v.id}

                        style={{
                            fontSize: '20px',
                            width: '100%',
                            color:
                                v.type === '市价触发' ? 'white' :
                                    v.type === '限价只减仓' ? 'yellow'
                                        : v.type === '止损' ? '#cc66ff'
                                            : this.props.side === 'Buy' ? 'rgba(72, 170, 101, 1)' : 'rgba(72, 170, 101, 1)'
                        }}>
                        <td style={{ width: '50%' }}>{v.price}</td>
                        <td style={{ width: '35%' }}>{v.cumQty}/{v.orderQty}</td>
                        <td style={{ width: '15%' }} >
                            <Button
                                bgColor='#24292d'
                                text='X'
                                width='100%'
                                left={() => rpc.取消委托({ cookie, orderID: [v.id] })}
                                right={() => rpc.取消委托({ cookie, orderID: [v.id] })}
                            />
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    }
}


class Button extends React.Component<{

    bgColor: string
    text: string
    width?: string
    left: () => Promise<{
        error?: JSONRequestError
        data?: boolean
        msg?: string
    }>
    right: () => Promise<{
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
                    this.callFunc(this.props.right)
                }
            }}
        >{this.props.text}</div>
    }
}




class APP extends React.Component<{}, { quxiao: string }> {
    componentWillMount() {
        this.setState({
            quxiao: '0'
        })
        const f = () => {
            requestAnimationFrame(f)
            this.forceUpdate()
        }
        f()
    }
    render() {
        return orderClient.isConnected === false ? <a href='#' onClick={() => location.reload()}><h1>连接中_点击刷新</h1></a> :
            <div style={{
                backgroundColor: '#24292d',
                margin: 'auto auto',
                width: '350px',
                height: '100%',
                padding: '10px 5px',
                overflow: 'hidden',
                fontFamily: 'SourceHanSansSC-regular',
                color: 'white',
                fontSize: '24px',
                userSelect: 'none',
                cursor: 'default'
            }}>
                <h3>只做摸顶抄底</h3>
                <br />
                <button onClick={() => {
                    if (nowSymbol === 'XBTUSD') {
                        nowSymbol = 'ETHUSD'
                    } else {
                        nowSymbol = 'XBTUSD'
                    }
                }}><h1>{nowSymbol}</h1></button>
                <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    margin: '20px 0'
                }}>
                    <span style={{ color: d().仓位数量 < 0 ? 'rgba(229, 101, 70, 1)' : 'rgba(72, 170, 101, 1)', fontSize: '24px' }}>{d().仓位数量}</span>
                    <span style={{ paddingLeft: '50px', fontSize: '24px' }}>@{d().开仓均价}</span>
                </div>
                <Button
                    bgColor='rgba(229, 101, 70, 1)'
                    text='市价平仓'
                    left={() => rpc.市价平仓({ cookie, symbol: nowSymbol })}
                    right={() => rpc.市价平仓({ cookie, symbol: nowSymbol })}
                />
                <div
                    style={{
                        fontSize: '20px',
                        marginLeft: '10px'
                    }}>
                </div>
                <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center'
                }}>
                    <div
                        style={{

                            width: '50%'
                        }}>
                        <Button
                            bgColor='rgba(72, 170, 101, 1)'
                            text={account.交易[nowSymbol].数量 + ''}
                            left={() => rpc.下单({
                                cookie,
                                symbol: nowSymbol,
                                type: 'maker',
                                side: 'Buy',
                                size: account.交易[nowSymbol].数量,
                                最低_最高: false,
                            })}
                            right={() => rpc.下单({
                                cookie,
                                symbol: nowSymbol,
                                type: 'taker',
                                side: 'Buy',
                                size: account.交易[nowSymbol].数量,
                                最低_最高: false,
                            })}
                        />

                        <br />

                        <Button
                            bgColor='rgba(72, 170, 101, 1)'
                            text={'5秒内最低价'}
                            left={() => rpc.下单({
                                cookie,
                                symbol: nowSymbol,
                                type: 'maker',
                                side: 'Buy',
                                size: account.交易[nowSymbol].数量,
                                最低_最高: true,
                            })}
                            right={() => rpc.下单({
                                cookie,
                                symbol: nowSymbol,
                                type: 'taker',
                                side: 'Buy',
                                size: account.交易[nowSymbol].数量,
                                最低_最高: true,
                            })}
                        />

                        <Table side='Buy' />
                    </div>
                    <div
                        style={{
                            width: '50%'
                        }}>
                        <Button
                            bgColor='rgba(229, 101, 70, 1)'
                            text={-account.交易[nowSymbol].数量 + ''}
                            left={() => rpc.下单({
                                cookie,
                                symbol: nowSymbol,
                                type: 'maker',
                                side: 'Sell',
                                size: account.交易[nowSymbol].数量,
                                最低_最高: false,
                            })}
                            right={() => rpc.下单({
                                cookie,
                                symbol: nowSymbol,
                                type: 'taker',
                                side: 'Sell',
                                size: account.交易[nowSymbol].数量,
                                最低_最高: false,
                            })}
                        />

                        <br />

                        <Button
                            bgColor='rgba(229, 101, 70, 1)'
                            text={'5秒内最高价'}
                            left={() => rpc.下单({
                                cookie,
                                symbol: nowSymbol,
                                type: 'maker',
                                side: 'Sell',
                                size: account.交易[nowSymbol].数量,
                                最低_最高: true,
                            })}
                            right={() => rpc.下单({
                                cookie,
                                symbol: nowSymbol,
                                type: 'taker',
                                side: 'Sell',
                                size: account.交易[nowSymbol].数量,
                                最低_最高: true,
                            })}
                        />

                        <Table side='Sell' />
                    </div>
                </div>
            </div >
    }
}

ReactDOM.render(<APP />, document.querySelector('#root'))