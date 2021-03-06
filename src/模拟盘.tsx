import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { theme } from './Chart/theme'
import { config } from './config'
import { Button } from './UI/Button'
import { HopexRealKLineHistory } from './RealDataServer/RealKLine/HopexRealKLineHistory'
import { RealKLineChart } from './RealKLineChart'
import { _________________TickBase } from './_________________TickBase'
import { Table } from './UI/Table'
import { 模拟盘__开平仓计算器 } from './模拟盘__开平仓计算器'
import { timeID } from './F/timeID'
import { reverse } from 'ramda'
import { layer } from './Chart'
import { LineLayer } from './Chart/Layer/LineLayer'
import { CustomizedSlider } from './UI/CustomizedSlider'

const RED = 'rgba(229, 101, 70, 1)'
const GREEN = 'rgba(72, 170, 101, 1)'


let real = new HopexRealKLineHistory()

const getTime = () => {
    if (real.kline.length > 0) {
        return timeID._60s.toTimestamp(real.kline[real.kline.length - 1].id)
    } else {
        return NaN
    }
}

//没有分买1 卖1 了
const getPrice = () => {
    if (real.kline.length > 0) {
        return real.kline[real.kline.length - 1].close
    } else {
        return NaN
    }
}

const xxx = new 模拟盘__开平仓计算器()
let spaceIsDown = false


class 交易 extends React.Component {

    倍数 = 1

    componentWillMount() {

        const f = () => {
            requestAnimationFrame(f)
            this.forceUpdate()

            if (
                (xxx.仓位数量 > 0 && getPrice() < xxx.开仓均价 - this.止损) ||
                (xxx.仓位数量 < 0 && getPrice() > xxx.开仓均价 + this.止损)
            ) {
                xxx.order({
                    time: getTime(),
                    price: getPrice(),
                    size: -xxx.仓位数量,
                })
            }
        }
        f()

        window.addEventListener('keydown', e => {
            if (e.keyCode >= 49 && e.keyCode <= 52) {
                this.倍数 = e.keyCode - 48
            }
            if (e.keyCode === 192) {
                this.倍数 = 0.5
            }
            if (e.keyCode === 32) spaceIsDown = true
        })

        window.addEventListener('keyup', e => {
            if (e.keyCode === 32) spaceIsDown = false
        })
    }

    止损 = 10

    render() {

        const 下单数量 = (config.下单数量 || 100) * this.倍数

        const arr = reverse(xxx.arr)

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
                        <p>止损</p>
                        <CustomizedSlider xxx={{ min: -10, max: 100, step: 10 }} value={this.止损} onChange={v => this.止损 = v} />
                        <p style={{ color: '#cc66ff' }}>BTC{xxx.仓位数量 !== 0 ? <a
                            href='#'
                            style={{ color: RED }}
                            onClick={() => xxx.order({
                                time: getTime(),
                                price: getPrice(),
                                size: -xxx.仓位数量,
                            })}
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
                                onClick={() => xxx.order({
                                    time: getTime(),
                                    price: getPrice(),
                                    size: 下单数量,
                                })}
                            />
                        </div>

                        <div
                            style={{
                                width: '50%'
                            }}>
                            <Button
                                bgColor={RED}
                                text={String(-下单数量)}
                                onClick={() => xxx.order({
                                    time: getTime(),
                                    price: getPrice(),
                                    size: -下单数量,
                                })}
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
                            render: v =>
                                <p style={{ color: '#49a965' }}>
                                    {new Date(v.时间).toLocaleTimeString()}
                                </p>
                        },
                        {
                            title: '仓位',
                            render: v => {
                                const { 仓位数量, 开仓均价 } = v
                                return <p>
                                    <span style={{ color: 仓位数量 < 0 ? RED : GREEN }}>{仓位数量 + '@'}</span><span style={{ color: 'black' }}>{开仓均价.toFixed(2)}</span>
                                </p>
                            }
                        },
                        {
                            title: '收益',
                            render: v => <p style={{ color: v.这次赚了 ? GREEN : RED }}>
                                {v.收益.toFixed(2)}
                            </p>
                        },
                    ]}
                    rowKey={v => v.id}
                />
            </div>
        </div>
    }


    get仓位() {
        if (xxx.仓位数量 !== 0) {
            return <span><span style={{ color: xxx.仓位数量 < 0 ? RED : GREEN }}>{String(xxx.仓位数量)}</span>@<span>{xxx.开仓均价.toFixed(2)}</span></span>
        } else {
            return undefined
        }
    }
}


class 模拟盘 extends React.Component {

    initChart = (element: HTMLElement | null) => {
        if (element) {
            RealKLineChart(element, real, () => {

                if (spaceIsDown === false) return undefined


                const xStrArr = xxx.arr.map(v => new Date(v.时间).toLocaleString())
                const arr = xxx.arr.map(v => v.收益)

                return {
                    xStrArr,
                    显示y: () => undefined,
                    left: 0,
                    right: xStrArr.length - 1,
                    items: {
                        heightList: [1],
                        items: [
                            {
                                layerList: [
                                    layer(LineLayer, { data: arr, color: 0xffffff }),
                                ]
                            },
                        ]
                    }
                }


            })
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