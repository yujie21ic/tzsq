import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { style } from 'typestyle'
import { OrderClient } from './OrderServer/OrderClient'
import { config } from './config'
import { getAccountName } from './ConfigType'
import { Switch } from '@material-ui/core'

const orderClient = new OrderClient(config.account![getAccountName()].cookie)
const d = () => orderClient.jsonSync.rawData.symbol.XBTUSD

const boxButton = style({
    width: '120px',
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
type Props = {
    
}
type State = {
    quxiao: string
}


class APP extends React.Component<Props, State> {
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
                margin: '15px auto',
                backgroundColor: 'rgba(229, 101, 70, 1)'
            }}>
                市价平仓</div>
            <div
                style={{
                    fontSize: '20px',

                }}>
                <span>止损任务<Switch value={d().任务.止损} color='primary' /></span><br />
                <span>止盈任务<Switch value={d().任务.止盈} color='secondary' /></span>
            </div>
            <div style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between'
            }}>
                <div
                    style={{
                        width: '50%'
                    }}>
                    <div className={boxButton} style={{
                        backgroundColor: 'rgba(72, 170, 101, 1)',

                    }}>
                        500</div>
                    <table style={{
                        width: '100%',
                        marginTop: '20px'
                    }}>
                        <tbody>
                            {d().活动委托.filter(v=>v.side==='Sell').map((v, i) =>
                                <tr key={v.id}
                                    style={{
                                        fontSize: '20px',
                                        width: '100%',
                                        color: v.type==='限价只减仓'?'rgba(255, 239, 85, 1)':v.type==='止损'?'rgba(229, 101, 70, 1)':'rgba(72, 170, 101, 1)'
                                    }}
                                    onMouseOver={() => this.setState({ quxiao: 'a' + i })}
                                    onMouseOut={() => this.setState({ quxiao: '0' })}>
                                    <td style={{ width: '45%' }}>{v.price}</td>
                                    <td style={{ width: '45%' }}>{v.size}</td>
                                    <td >
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
                                        }}>
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
                        width: '100%',
                        marginTop: '20px'
                    }}>
                        <tbody>
                            {d().活动委托.filter(v=>v.side==='Buy').map((v, i) =>
                                <tr key={v.id}
                                    style={{
                                        fontSize: '20px',
                                        color: v.type==='限价只减仓'?'rgba(255, 239, 85, 1)':v.type==='止损'?'rgba(229, 101, 70, 1)':'rgba(229, 101, 70, 1)'
                                    }}
                                    onMouseOver={() => this.setState({ quxiao: 'b' + i })}
                                    onMouseOut={() => this.setState({ quxiao: '0' })}>
                                    <td style={{ width: '45%' }}>{v.price}</td>
                                    <td style={{ width: '45%' }}>{v.size}</td>
                                    <td >
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
                                        }}>
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

ReactDOM.render(<APP/>, document.querySelector('#root'))