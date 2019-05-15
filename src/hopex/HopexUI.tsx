import * as React from 'react'
import { Table } from '../lib/UI/Table'
import { Button } from '../lib/UI/Button'
import { HopexHTTP } from './HopexHTTP'

const RED = 'rgba(229, 101, 70, 1)'
const GREEN = 'rgba(72, 170, 101, 1)'

export class HopexUI extends React.Component<{ 倍数: number }> {

    componentWillMount() {
        // const f = () => {
        //     requestAnimationFrame(f)
        //     this.forceUpdate()
        // }
        // f()
    }

    render() {
        const 下单数量 = 1

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
            <h1>hopex BTCUSDT</h1>
            <Table
                dataSource={[
                    {
                        id: 1,
                        x: 111,
                    },
                    {
                        id: 2,
                        x: 1222,
                    },
                ]}
                columns={[
                    {
                        title: '账号',
                        width: '20%',
                        render: v =>
                            <p style={{ color: '#49a965' }}>
                                1
                            </p>
                    },
                    {
                        title: '仓位',
                        width: '50%',
                        render: v =>
                            <p style={{ color: '#49a965' }}>
                                xxxxxxxyyyy
                            </p>
                    },
                    {
                        title: '权益',
                        width: '30%',
                        render: v =>
                            <p style={{ color: '#e56546' }}>
                                200.3
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