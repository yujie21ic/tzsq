import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { style } from 'typestyle'
import { reverse } from 'ramda'
import { DataClient } from './RealDataServer/DataClient'
import { dialog } from './lib/UI/dialog'
import { setWindowTitle } from './lib/F/setWindowTitle'

const orderTbodyTdSell = style({

    $nest: {
        '&:active': {
            boxShadow: '2px 2px 2px #999 inset'
        },
        '&:nth-child(odd)': {
            backgroundColor: '#f5f2ee'
        },
        '&:nth-child(even)': {
            backgroundColor: '#ffffff'
        },
        '&:hover': {
            backgroundColor: 'rgba(229,101,70,0.4) !important'
        },
    }
})

const orderTbodyTdBuy = style({

    $nest: {
        '&:nth-child(odd)': {
            backgroundColor: '#f5f2ee'
        },
        '&:nth-child(even)': {
            backgroundColor: '#ffffff'
        },
        '&:active': {
            boxShadow: '2px 2px 2px #999 inset'
        },
        '&:hover': {
            backgroundColor: 'rgba(72, 170, 101, 0.4) !important'
        },
    }
})

const length = style({
    height: '26px',
    position: 'absolute',
    mixBlendMode: 'multiply',
    marginTop: '2px'
})

const orderBox = style({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    height: '100%',
    width: '100%'
})

const orderTable = style({
    width: '98%',
    borderCollapse: 'collapse',
    border: '1px solid #bbb',
    margin: 'auto auto'
})

const nowPrice = style({
    height: '14%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '2rem'
})
const orderTbodyTh = style({
    height: '30px',
    fontSize: '20px',
    fontWeight: 900,
    lineHeight: '30px',
    textAlign: 'right',
    userSelect: 'none',
    paddingRight: '20px'
})

export const Ordering = (props: {
    data: {
        price: number
        sell: {
            price: number
            size: number
        }[]
        buy: {
            price: number
            size: number
        }[]
    }
}) =>
    <div className={orderBox}>
        <Table
            data={{
                className: orderTbodyTdSell,
                color: '#e56546',
                backgroundColor: 'rgba(229,101,70,0.2)',
                nowData1: reverse(props.data.sell),
                nowData2: props.data.buy
            }} />
        <div className={nowPrice}>{props.data.price.toString()}</div>
        <Table
            data={{
                className: orderTbodyTdBuy,
                color: '#49a965',
                backgroundColor: 'rgba(72, 170, 101, 0.2)',
                nowData1: props.data.buy,
                nowData2: props.data.sell,
            }} />
    </div>


const Table = (props: {
    data: {
        className: string
        color: string
        backgroundColor: string
        nowData1: {
            price: number
            size: number
        }[]
        nowData2: {
            price: number
            size: number
        }[]
    }
}) => <table className={orderTable}>
        <tbody>
            <tr >
                <th className={orderTbodyTh} >价格</th>
                <th className={orderTbodyTh}>目前仓位数量</th>

            </tr>
            {props.data.nowData1.map((v, i) =>
                <tr key={i} className={props.data.className}  >
                    <td className={orderTbodyTh} style={{ color: props.data.color, width: '30%' }}>{v.price.toFixed(2)}</td>
                    <td className={orderTbodyTh} style={{ color: props.data.color, textAlign: 'right', padding: '1px 0' }}>
                        <div style={{ position: 'relative' }}>
                            <div className={length} style={{
                                width: (v.size / Math.max(...props.data.nowData1.map(v => v.size), ...props.data.nowData2.map(v => v.size)) * 100).toFixed(2) + '%',
                                backgroundColor: props.data.backgroundColor
                            }}>&nbsp;</div>
                            <span style={{ position: 'relative', paddingRight: '20px' }}>
                                {(v.size / 10000).toFixed(2)}万
                            </span>
                        </div>
                    </td>
                </tr>
            )}
        </tbody>
    </table>





const realTickClient = new DataClient.RealData__Client()
class APP extends React.Component {

    componentWillMount() {

        const f = () => {
            requestAnimationFrame(f)
            this.forceUpdate()
        }
        f()
    }

    render() {

        const item = realTickClient.data.ctp.rb1910

        return <Ordering
            data={{
                price: (item.data[item.data.length - 1] || { close: NaN }).close,
                sell: item.orderBook[item.orderBook.length - 1] ? item.orderBook[item.orderBook.length - 1].sell : [],
                buy: item.orderBook[item.orderBook.length - 1] ? item.orderBook[item.orderBook.length - 1].buy : [],
            }}
        />
    }
}


ReactDOM.render(<APP />, document.querySelector('#root'))