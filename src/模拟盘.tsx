import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { theme } from './lib/Chart/theme'
import { config } from './config'
import { Button } from './lib/UI/Button'
import { HopexRealKLine } from './RealDataServer/HopexRealKLine'
import { RealKLineChart } from './RealKLineChart'
import { _________________TickBase } from './_________________TickBase'
import { Table } from './lib/UI/Table'

const RED = 'rgba(229, 101, 70, 1)'
const GREEN = 'rgba(72, 170, 101, 1)'

class 交易 extends React.Component {

    倍数 = 1

    componentWillMount() {

        const f = () => {
            requestAnimationFrame(f)
            this.forceUpdate()
        }
        f()

        window.addEventListener('keydown', e => {
            if (e.keyCode >= 49 && e.keyCode <= 52) {
                this.倍数 = e.keyCode - 48
            }
            if (e.keyCode === 192) {
                this.倍数 = 0.5
            }
        })
    }


    render() {
        let 仓位数量 = 12345

        const 下单数量 = (config.下单数量 || 100) * this.倍数

        const arr = new Array(100).fill(0).map(v => (
            { id: 1, 仓位数量: 11, 开仓均价: 8000, 收益: -3 }
        ))

        return <div>
            <div
                style={{
                    backgroundColor: '#24292d',
                    margin: 'auto auto',
                    width: `${theme.右边空白}px`,
                    padding: '10px 5px',
                    fontFamily: 'SourceHanSansSC-regular',
                    color: 'white',
                    fontSize: '24px',
                    userSelect: 'none',
                    cursor: 'default'
                }}>
                <div>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'left',
                    }}>
                        <p style={{ color: '#cc66ff' }}>BTC{仓位数量 !== 0 ? <a
                            href='#'
                            style={{ color: RED }}
                            onClick={() => alert('TODO')}
                        >市价平仓</a> : undefined} </p>
                        <p>仓位:{this.get仓位()}</p>
                    </div>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'center'
                    }}>
                        <div
                            style={{ width: '50%' }}>
                            <Button
                                bgColor={GREEN}
                                text={String(下单数量)}
                                onClick={() => alert('TODO')}
                            />
                        </div>

                        <div
                            style={{
                                width: '50%'
                            }}>
                            <Button
                                bgColor={RED}
                                text={String(-下单数量)}
                                onClick={() => alert('TODO')}
                            />
                        </div>
                    </div>
                </div >
            </div>

            <div style={{ height: 500 }}>
                <Table
                    dataSource={arr}
                    columns={[
                        {
                            title: '时间',
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
                                const { 仓位数量, 开仓均价 } = v
                                return <p>
                                    <span style={{ color: 仓位数量 < 0 ? RED : GREEN }}>{仓位数量 + '@'}</span><span style={{ color: 'black' }}>{开仓均价}</span>
                                </p>
                            }
                        },
                        {
                            title: '收益',
                            width: '30%',
                            render: v => <p style={{ color: 'black' }}>
                                {111}
                            </p>
                        },
                    ]}
                    rowKey={v => v.id}
                />
            </div>
        </div>
    }


    get仓位() {
        let 仓位数量 = 1234
        let 开仓均价 = 8000

        if (仓位数量 !== 0) {
            return <span><span style={{ color: 仓位数量 < 0 ? RED : GREEN }}>{String(仓位数量)}</span>@<span>{String(开仓均价)}</span></span>
        } else {
            return undefined
        }
    }
}


class 模拟盘 extends React.Component {

    initChart = (element: HTMLElement | null) => {
        if (element) {
            RealKLineChart(element, new HopexRealKLine())
        }
    }

    render() {
        return <div style={{ display: 'flex', height: '100%' }}>
            <div style={{ flex: '1 1 auto' }} ref={this.initChart} />
            <div style={{ width: `${theme.右边空白}px` }}><交易 /></div>
        </div>
    }
}

ReactDOM.render(<模拟盘 />, document.querySelector('#root'))





//开平 计算器

/*

marketOrder(side: Side, count: number) {
    this.entryPrice = (this.entryPrice * Math.abs(this.myPosition) + this.lastPrice * count) / (Math.abs(this.myPosition) + count)

    if (side == 'Buy') {
        this.myPosition += count
    } else {
        this.myPosition -= count
    }

    if (this.maxPosition < Math.abs(this.myPosition)) {
        this.maxPosition = Math.abs(this.myPosition)
    }
}


marketCloseAll() {
    const 盈利 = this.myPosition * (1 / this.entryPrice - 1 / this.lastPrice)
    this.myPosition = 0
    this.entryPrice = 0
    this.accumulatedProfit += 盈利
    this.closePositionTimes += 1
}

*/