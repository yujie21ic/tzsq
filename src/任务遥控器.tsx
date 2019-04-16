import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { config } from './config'
import { windowExt } from './windowExt'
import { OrderClient } from './OrderServer/OrderClient'
import { Switch } from '@material-ui/core'
import { kvs } from './lib/F/kvs'
import { dialog } from './lib/UI/dialog'

const { cookie } = config.account![windowExt.accountName]
const orderClient = new OrderClient(cookie)


class APP extends React.Component {

    componentWillMount() {
        const f = () => {
            requestAnimationFrame(f)
            this.forceUpdate()
        }
        f()
    }

    任务开关 = (名字: string) => {
        const item = orderClient.jsonSync.rawData.任务.find(v => v.名字 === 名字)
        if (item !== undefined) {
            OrderClient.rpc.func.任务({
                cookie,
                名字,
                开关: !item.开关,
                参数: item.参数,
            })
        }
    }

    setValue = (名字: string, key: string, value: any) => {
        const item = orderClient.jsonSync.rawData.任务.find(v => v.名字 === 名字)

        if (item !== undefined) {
            OrderClient.rpc.func.任务({
                cookie,
                名字,
                开关: item.开关,
                参数: JSON.stringify({ ...JSON.parse(item.参数), [key]: value }),
            })
        }

    }

    renderItem = (名字: string, key: string, value: any) => {
        if (typeof value === 'boolean') {
            return <Switch checked={value} onChange={() => this.setValue(名字, key, !value)} />
        }
        else if (typeof value === 'number') {
            return <a
                style={{ fontSize: 28, color: 'yellow' }}
                href='#'
                onClick={() => {
                    dialog.showInput({
                        title: key,
                        value: String(value),
                        onOK: v => this.setValue(名字, key, Number(v)),
                    })
                }}
            >
                {String(value)}
            </a>
        }
        else if (value === 'Sell' || value === 'Buy') {
            return <a
                style={{ fontSize: 28, color: value === 'Sell' ? 'red' : 'green' }}
                href='#'
                onClick={() => this.setValue(名字, key, value === 'Sell' ? 'Buy' : 'Sell')}
            >
                {String(value)}
            </a>
        }
        else {
            return String(value)
        }
    }

    render() {
        return orderClient.isConnected === false ?
            <a href='#' onClick={() => location.reload()}><h1>连接中_点击刷新</h1></a> :
            <div style={{
                backgroundColor: '#24292d',
                margin: 'auto auto',
                padding: '10px 5px',
                fontFamily: 'SourceHanSansSC-regular',
                color: 'white',
                fontSize: '24px',
                userSelect: 'none',
                cursor: 'default'
            }}>
                {orderClient.jsonSync.rawData.任务.map(v =>
                    <div
                        key={v.名字}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'left',
                        }}>
                        <p style={{ color: '#cc66ff' }}>{v.名字}</p>
                        开关:<Switch checked={v.开关} onChange={() => this.任务开关(v.名字)} />
                        参数:
                    {kvs(JSON.parse(v.参数)).map(p =>
                            <div key={p.k}>
                                {p.k}:{this.renderItem(v.名字, p.k, p.v)}
                            </div>
                        )}
                    </div>
                )}
            </div >
    }
}


ReactDOM.render(<APP />, document.querySelector('#root'))