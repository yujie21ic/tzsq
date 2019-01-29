import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { 交易 } from './交易'
import { 提醒 } from './提醒'

import { DataClient } from './RealDataServer/DataClient'
import { TickBase } from './TickBase'

class Tick行情 extends TickBase {
    title = '实时'
    real = new DataClient.RealData__Client()

    constructor(element: HTMLElement) {
        super(element)
    }
}

class 实盘 extends React.Component {

    initChart = (element: HTMLElement | null) => {
        if (element !== null) {
            new Tick行情(element)
        }
    }

    render() {
        return <div style={{ display: 'flex', height: '100%' }}>
            <div style={{ flex: '1 1 auto' }} ref={this.initChart} />
            <div style={{ width: '350px' }}><交易 /><提醒 /></div>
        </div>
    }
}

ReactDOM.render(<实盘 />, document.querySelector('#root'))