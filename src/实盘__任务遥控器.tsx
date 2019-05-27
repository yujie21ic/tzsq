import * as React from 'react'
import { config } from './config'
import { windowExt } from './windowExt'
import { OrderClient } from './OrderServer/OrderClient'
import { Switch } from '@material-ui/core'
import { kvs } from './F/kvs'
import { dialog } from './UI/dialog'

const { cookie } = config.account![windowExt.accountName]
const orderClient = new OrderClient(cookie)

export class 实盘__任务遥控器 extends React.Component {

    折叠dic = new Map<string, boolean>()

    componentWillMount() {
        const f = () => {
            requestAnimationFrame(f)
            this.forceUpdate()
        }
        f()
    }

    set_任务_开关 = (名字: string) => {
        const item = orderClient.jsonSync.rawData.任务.find(v => v.名字 === 名字)
        if (item !== undefined) {
            OrderClient.rpc.func.set_任务_开关({
                cookie,
                名字,
                开关: !item.开关,
            })
        }
    }

    set_任务_参数 = (名字: string, key: string, value: any) => {
        const item = orderClient.jsonSync.rawData.任务.find(v => v.名字 === 名字)

        if (item !== undefined) {
            OrderClient.rpc.func.set_任务_参数({
                cookie,
                名字,
                参数: JSON.stringify({ [key]: value }),
            })
        }

    }

    renderItem = (名字: string, key: string, value: any) => {
        if (typeof value === 'boolean') {
            return <Switch checked={value} onChange={() => this.set_任务_参数(名字, key, !value)} />
        }
        else if (typeof value === 'number') {
            return <a
                style={{ fontSize: 28, color: 'yellow' }}
                href='#'
                onClick={() => {
                    dialog.showInput({
                        title: key,
                        value: String(value),
                        onOK: v => this.set_任务_参数(名字, key, Number(v)),
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
                onClick={() => this.set_任务_参数(名字, key, value === 'Sell' ? 'Buy' : 'Sell')}
            >
                {String(value)}
            </a>
        }
        else {
            return String(value)
        }
    }

    render() {
        return <div style={{
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


                    <p><a style={{ fontSize: 28, color: this.折叠dic.get(v.名字) ? '#cc66ff' : '#666666' }} href='#' onClick={() => {
                        this.折叠dic.set(v.名字, !this.折叠dic.get(v.名字))
                    }}>{v.名字}</a><Switch checked={v.开关} onChange={() => this.set_任务_开关(v.名字)} /></p>


                    {this.折叠dic.get(v.名字) ?
                        kvs(JSON.parse(v.参数)).map(p =>
                            <div key={p.k}>
                                {p.k}:{this.renderItem(v.名字, p.k, p.v)}
                            </div>
                        ) : ''
                    }
                </div>
            )}
        </div >
    }
} 