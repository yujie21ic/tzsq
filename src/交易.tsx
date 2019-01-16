import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { style } from 'typestyle'
import { OrderClient } from './OrderServer/OrderClient'
import { config } from './config'
import { getAccountName } from './ConfigType'
import { Switch } from '@material-ui/core'
import { JSONRequestError } from './lib/C/JSONRequest'
import { dialog } from './lib/UI/dialog';

const cookie = config.account![getAccountName()].cookie
const orderClient = new OrderClient(cookie)
const d = () => orderClient.jsonSync.rawData.symbol.XBTUSD
const rpc = OrderClient.rpc.func



const boxButton = style({
    margin: '15px auto',
    width: '150px',
    height: '36px',
    lineHeight: '36px',
    borderRadius: '2px 2px 2px 2px',
    fontSize: '18px',
    textAlign: 'center',
    boxShadow: '0px 8px 8px 0px rgba(0, 0, 0, 0.24)',
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
    func: () => Promise<{
        error?: JSONRequestError
        data?: boolean
        msg?: string
    }>
}, { loading: boolean }> {

    componentWillMount() {
        this.setState({ loading: false })
    }

    callFunc() {
        this.setState({ loading: true })
        this.props.func().then(({ error, msg, data }) => {
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
        })
    }

    render() {
        return <div />
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
        return <div style={{
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
            <span>XBTUSD</span>
            <div style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                margin: '20px 0'
            }}>
                <span style={{ color: d().仓位数量 < 0 ? 'rgba(229, 101, 70, 1)' : 'rgba(72, 170, 101, 1)', fontSize: '24px' }}>{d().仓位数量}</span>
                <span style={{ paddingLeft: '50px', fontSize: '24px' }}>@{d().开仓均价}</span>
            </div>
            <div className={boxButton} style={{

                backgroundColor: 'rgba(229, 101, 70, 1)'
            }}>
                市价平仓</div>
            <div
                style={{
                    fontSize: '20px',
                    marginLeft: '10px'
                }}>
                <span>止损任务<Switch value={d().任务.止损} color='primary' /></span><br />
                <span>止盈任务<Switch value={d().任务.止盈} color='secondary' /></span>
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
                    <div className={boxButton} style={{
                        backgroundColor: 'rgba(72, 170, 101, 1)'
                    }}>
                        500</div>
                    <table style={{
                        width: '150px',
                        margin: '15px auto',
                    }}>
                        <tbody>
                            {d().活动委托.filter(v => v.side === 'Sell').map((v, i) =>
                                <tr key={v.id}
                                    style={{
                                        fontSize: '20px',
                                        width: '100%',
                                        color: v.type === '限价只减仓' ? 'rgba(255, 239, 85, 1)' : v.type === '止损' ? 'rgba(229, 101, 70, 1)' : 'rgba(72, 170, 101, 1)'
                                    }}
                                    onMouseOver={() => this.setState({ quxiao: 'a' + i })}
                                    onMouseOut={() => this.setState({ quxiao: '0' })}>
                                    <td style={{ width: '50%' }}>{v.price}</td>
                                    <td style={{ width: '35%' }}>{v.size}</td>
                                    <td style={{ width: '15%' }}>
                                        <button style={{
                                            display: this.state.quxiao === 'a' + i ? '' : 'none',
                                            color: 'white',
                                            fontSize: '18px',
                                            margin: '0',
                                            padding: '0',
                                            border: '1px solid #24292d',
                                            outline: 'none',
                                            backgroundColor: '#24292d',
                                            cursor: 'pointer'
                                        }}
                                            onClick={() => rpc.取消委托({ cookie, orderID: [v.id] })}>
                                            X</button>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div
                    style={{
                        width: '50%'
                    }}>
                    <div className={boxButton} style={{

                        backgroundColor: 'rgba(229, 101, 70, 1)',

                    }}>
                        -500</div>
                    <table style={{
                        width: '150px',
                        margin: '15px auto',
                    }}>
                        <tbody>
                            {d().活动委托.filter(v => v.side === 'Buy').map((v, i) =>
                                <tr key={v.id}
                                    style={{
                                        fontSize: '20px',
                                        color: v.type === '限价只减仓' ? 'rgba(255, 239, 85, 1)' : v.type === '止损' ? 'rgba(229, 101, 70, 1)' : 'rgba(229, 101, 70, 1)'
                                    }}
                                    onMouseOver={() => this.setState({ quxiao: 'b' + i })}
                                    onMouseOut={() => this.setState({ quxiao: '0' })}>
                                    <td style={{ width: '50%' }}>{v.price}</td>
                                    <td style={{ width: '35%' }}>{v.size}</td>
                                    <td style={{ width: '15%' }}>
                                        <button style={{
                                            display: this.state.quxiao === 'b' + i ? '' : 'none',
                                            color: 'white',
                                            fontSize: '18px',
                                            margin: '0',
                                            padding: '0',
                                            border: '0px solid #24292d',
                                            outline: 'none',
                                            backgroundColor: '#24292d',
                                            cursor: 'pointer'
                                        }}
                                            onClick={() => rpc.取消委托({ cookie, orderID: [v.id] })}>
                                            X</button>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

            </div>
        </div >
    }
}

ReactDOM.render(<APP />, document.querySelector('#root'))