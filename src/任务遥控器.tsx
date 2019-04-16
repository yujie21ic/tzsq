import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { config } from './config'
import { windowExt } from './windowExt'
import { OrderClient } from './OrderServer/OrderClient'
import { Switch } from '@material-ui/core'

const account = config.account![windowExt.accountName]
const orderClient = new OrderClient(account.cookie)


class APP extends React.Component {

    componentWillMount() {
        orderClient.jsonSync.subject.subscribe(v => {
            this.forceUpdate()
        })
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
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'left',
            }}>

                {orderClient.jsonSync.rawData.任务.map(v =>
                    <div>
                        <p style={{ color: '#cc66ff' }}>{v.名字}</p>
                        开关:<Switch checked={v.开关} onChange={(e, v) => { }} />
                        参数:<pre>{JSON.stringify(JSON.parse(v.参数), undefined, 4)}</pre>
                    </div>
                )}
            </div>
        </div >
    }
}


ReactDOM.render(<APP />, document.querySelector('#root'))