import * as React from 'react'
import { Table } from '../lib/UI/Table'
import { Button } from '../lib/UI/Button'
import { HopexHTTP } from './HopexHTTP'
import { config } from '../config'
import { kvs } from '../lib/F/kvs'

const RED = 'rgba(229, 101, 70, 1)'
const GREEN = 'rgba(72, 170, 101, 1)'

const obj = config.hopex || {}
const datasource = kvs(obj).map(v => ({
    id: v.k,
    下单数量: v.v.下单数量,
    偏移: v.v.偏移,
}))

const 仓位数量 = 2000
const 开仓均价 = 8000
const 下单数量 = 1

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
            <p>hopex BTCUSDT</p>
            <Table
                dataSource={datasource}
                columns={[
                    {
                        title: '账号',
                        width: '30%',
                        render: v =>
                            <p style={{ color: '#49a965' }}>
                                {v.id}
                            </p>
                    },
                    {
                        title: '仓位',
                        width: '50%',
                        render: v =>
                            <p>
                                <span style={{ color: 仓位数量 < 0 ? RED : GREEN }}>{仓位数量 + '@'}</span><span style={{ color: 'black' }}>{开仓均价}</span>
                            </p>
                    },
                    {
                        title: '权益',
                        width: '20%',
                        render: v =>
                            <p style={{ color: '#e56546' }}>
                                8000
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
                        text={-下单数量 + ''}
                        left={() => HopexHTTP.taker(`hopexCookie`, {
                            symbol: 'BTCUSDT',
                            side: 'Buy',
                            size: 下单数量,
                        })}
                        right={() => HopexHTTP.taker(`hopexCookie`, {
                            symbol: 'BTCUSDT',
                            side: 'Buy',
                            size: 下单数量,
                        })}
                    />
                </div>
                <div
                    style={{ width: '50%' }}>
                    <Button
                        bgColor={RED}
                        text={-下单数量 + ''}
                        left={() => HopexHTTP.taker(`hopexCookie`, {
                            symbol: 'BTCUSDT',
                            side: 'Sell',
                            size: 下单数量,
                        })}
                        right={() => HopexHTTP.taker(`hopexCookie`, {
                            symbol: 'BTCUSDT',
                            side: 'Sell',
                            size: 下单数量,
                        })}
                    />
                </div>
            </div>

            <br />

            <Button
                bgColor='#666666'
                text='市价全平'
                left={() => HopexHTTP.taker(`hopexCookie`, {
                    symbol: 'BTCUSDT',
                    side: 'Sell',
                    size: 下单数量,
                })}
                right={() => HopexHTTP.taker(`hopexCookie`, {
                    symbol: 'BTCUSDT',
                    side: 'Sell',
                    size: 下单数量,
                })}
            />
        </div >
    }

}