import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { BaseType } from './lib/BaseType'
import { config } from './config'
import { YJMM, getAccountName } from './ConfigType'
import { JSONRequestError } from './lib/C/JSONRequest'
import { OrderClient } from './OrderServer/OrderClient'
import { Table } from './lib/UI/Table'
import { dialog } from './lib/UI/dialog'

type ButtonProps = {
    color: string
    textArr: string[]
    leftAPI?: () => Promise<{ error?: JSONRequestError, msg?: string, data?: string }>
    rightAPI?: () => Promise<{ error?: JSONRequestError, msg?: string, data?: string }>
}

type ButtonState = {
    loading: boolean
}

class Button extends React.Component<ButtonProps, ButtonState> {

    componentWillMount() {
        this.setState({
            loading: false
        })
    }

    onClick = async (f?: () => Promise<{ error?: JSONRequestError, msg?: string, data?: string }>) => {
        if (f !== undefined) {
            this.setState({ loading: true })
            const v = await f()
            this.setState({ loading: false })
            if (v.error !== undefined) {
                dialog.showMessageBox({
                    title: v.error,
                    contentText: v.msg || ''
                })
            }
            else if (v.data !== undefined && v.data !== '') {
                dialog.showMessageBox({
                    title: '失败',
                    contentText: v.data
                })
            }
        }
    }

    render() {
        return <button
            style={{
                cursor: this.state.loading ? 'default' : 'pointer',
                width: '100%',
                height: '100%',
                color: 'white',
                fontSize: '24px',
                lineHeight: '35px',
                opacity: this.state.loading ? 0.75 : 1,
                backgroundColor: this.props.color
            }}
            disabled={this.state.loading}
            onMouseUp={e => {
                if (e.button === 0) {
                    this.onClick(this.props.leftAPI)
                }
                else if (e.button === 2) {
                    this.onClick(this.props.rightAPI)
                }
            }}
        >
            <div style={{ alignItems: 'center' }}>{this.props.textArr.map((v, i) => <p key={i}>{v}</p>)}</div>
        </button>
    }
}



const 买卖 = (cookie: string, p: YJMM) => (side: BaseType.Side, type: 'maker' | 'taker') => () => OrderClient.rpc.func.下单和止损({
    cookie: cookie,
    symbol: p.symbol,
    side: side,
    size: p.size,
    止损点: p.止损点,
    type,
    延迟下单: p.延迟下单
})

const 市价平仓 = (cookie: string, symbol: BaseType.BitmexSymbol) => () => OrderClient.rpc.func.市价平仓({
    cookie: cookie,
    symbol: symbol,
})

const 取消委托 = (cookie: string, symbol: BaseType.BitmexSymbol) => () => OrderClient.rpc.func.取消全部委托({
    cookie: cookie,
    symbol: symbol,
})







const accountClient = new OrderClient(config.account![getAccountName()].cookie)

class XXXX extends React.Component<{ symbol: BaseType.BitmexSymbol }> {

    componentWillMount() {
        const f = () => {
            requestAnimationFrame(f)
            this.forceUpdate()
        }
        f()
    }

    render() {
        return <button
            style={{
                cursor: 'default',
                width: '100%',
                height: '100%',
                color: 'white',
                fontSize: '24px',
                lineHeight: '35px',
                opacity: 1,
                backgroundColor: 'black'
            }}
        >
            <div style={{ alignItems: 'center' }}>
                <p>{accountClient.isConnected ? '连上' : '断开'}:{accountClient.jsonSync.rawData.symbol[this.props.symbol as 'XBTUSD'].状态}</p>
                <p>msg:{accountClient.jsonSync.rawData.symbol[this.props.symbol as 'XBTUSD'].msg} </p>
            </div>
        </button>
    }
}





const { cookie, 一键买卖 } = config.account![getAccountName()]

ReactDOM.render(<Table
    dataSource={一键买卖}
    columns={[
        {
            title: 'A',
            render: v => <Button
                color='#48aa65'
                textArr={[
                    v.symbol,
                    (v.延迟下单.length === 1 ? '延迟下单' : '直接下单') + v.size.toString(),
                ]}
                leftAPI={买卖(cookie, v)('Buy', 'maker')}
                rightAPI={买卖(cookie, v)('Buy', 'taker')}
            />
        },
        {
            title: 'B',
            render: v => <Button
                color='#e56546'
                textArr={[
                    v.symbol,
                    (v.延迟下单.length === 1 ? '延迟下单' : '直接下单') + (-v.size).toString(),
                ]}
                leftAPI={买卖(cookie, v)('Sell', 'maker')}
                rightAPI={买卖(cookie, v)('Sell', 'taker')}
            />
        },
        {
            title: 'C',
            render: v => <Button
                color='#005F91'
                textArr={['市价平仓']}
                leftAPI={市价平仓(cookie, v.symbol)}
                rightAPI={undefined}
            />
        },
        {
            title: 'D',
            render: v => <Button
                color='#005F91'
                textArr={['取消委托']}
                leftAPI={取消委托(cookie, v.symbol)}
                rightAPI={undefined}
            />
        },
        {
            title: 'E',
            render: v => <XXXX symbol={v.symbol} />
        }
    ]}
    rowKey={(_, index) => index}
/>, document.querySelector('#root')) 