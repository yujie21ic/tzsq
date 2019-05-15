import * as React from 'react'
import { Table } from '../lib/UI/Table'
import { Button } from '../lib/UI/Button'
import { HopexHTTP } from './HopexHTTP'
import { config } from '../config'
import { kvs } from '../lib/F/kvs'
import { HopexClient } from './HopexClient'

const RED = 'rgba(229, 101, 70, 1)'
const GREEN = 'rgba(72, 170, 101, 1)'

const datasource = kvs(config.hopex || {}).map(v => ({
    id: v.k,
    下单数量: v.v.下单数量,
    偏移: v.v.偏移,
    client: new HopexClient(v.v.cookie),
}))

const buy = () => HopexHTTP.taker(`hopexCookie`, {
    symbol: 'BTCUSDT',
    side: 'Buy',
    size: 1,
})

const sell = () => HopexHTTP.taker(`hopexCookie`, {
    symbol: 'BTCUSDT',
    side: 'Sell',
    size: 1,
})

const close = () => HopexHTTP.taker(`hopexCookie`, {
    symbol: 'BTCUSDT',
    side: 'Sell',
    size: 1,
})


export class HopexUI extends React.Component<{ 倍数: number }> {

    componentWillMount() {
        // const f = () => {
        //     requestAnimationFrame(f)
        //     this.forceUpdate()
        // }
        // f()
    }

    render() {


        return <div
            style={{
                backgroundColor: '#24292d',
                margin: 'auto auto',
                padding: '10px 5px',
                fontFamily: 'SourceHanSansSC-regular',
                color: 'white',
                fontSize: '24px',
                userSelect: 'none',
                cursor: 'default'
            }}>
            <p>hopex BTCUSDT {this.props.倍数}倍</p>
            <Table
                dataSource={datasource}
                columns={[
                    {
                        title: '账号',
                        width: '20%',
                        render: v =>
                            <p style={{ color: '#49a965' }}>
                                {v.id}
                            </p>
                    },
                    {
                        title: '仓位',
                        width: '50%',
                        render: v => {
                            const { 仓位数量, 开仓均价 } = v.client.symbol['BTCUSDT']
                            return <p>
                                <span style={{ color: 仓位数量 < 0 ? RED : GREEN }}>{仓位数量 + '@'}</span><span style={{ color: 'black' }}>{开仓均价}</span>
                            </p>
                        }
                    },
                    {
                        title: '权益',
                        width: '30%',
                        render: v => <p style={{ color: 'black' }}>
                            {v.client.权益}
                        </p>
                    },
                ]}
                rowKey={v => v.id}
            />

            <br />

            <div style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center'
            }}>
                <div
                    style={{ width: '50%' }}>
                    <Button
                        bgColor={GREEN}
                        text={'Buy ' + this.props.倍数 + '倍'}
                        left={buy}
                    />
                </div>
                <div
                    style={{ width: '50%' }}>
                    <Button
                        bgColor={RED}
                        text={'Sell ' + this.props.倍数 + '倍'}
                        left={sell}
                    />
                </div>
            </div>

            <br />

            <Button
                bgColor='#666666'
                text='市价全平'
                left={close}
            />
        </div >
    }

}