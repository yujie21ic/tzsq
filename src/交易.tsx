import * as React from 'react'
import { OrderClient } from './OrderServer/OrderClient'
import { config } from './config'
import { BaseType } from './lib/BaseType'
import { windowExt } from './windowExt'
import { Button } from './lib/UI/Button'
import { theme } from './lib/Chart/theme'
import { JSONRequest } from './lib/C/JSONRequest'
import { dialog } from './lib/UI/dialog'

const account = config.account![windowExt.accountName]
const { cookie } = account
const orderClient = new OrderClient(account.cookie)
const rpc = OrderClient.rpc.func

const RED = 'rgba(229, 101, 70, 1)'
const GREEN = 'rgba(72, 170, 101, 1)'

class Item extends React.Component<{ symbol: BaseType.BitmexSymbol, 位置: number, 倍数: number }> {

    get止损() {
        const arr = orderClient.jsonSync.rawData.symbol[this.props.symbol].活动委托.filter(v => v.type === '止损')
        if (arr.length === 1) {
            return arr[0].price
        } else {
            return undefined
        }
    }

    get委托() {
        const arr = orderClient.jsonSync.rawData.symbol[this.props.symbol].活动委托.filter(v => v.type !== '止损')
        if (arr.length === 1) {
            const { id, side, cumQty, orderQty, price, type } = arr[0]
            return <a
                href='#'
                style={{ color: 'white' }}
                onClick={() => rpc.取消委托({ cookie, orderID: [id] })}
            >
                <span style={{ color: side === 'Sell' ? RED : GREEN }}>{cumQty}/{orderQty}</span>
                <span>@{price}{type === '市价触发' ? '市价' : ''}</span>
            </a>
        } else {
            return undefined
        }
    }

    get仓位() {
        const { 仓位数量, 开仓均价 } = orderClient.jsonSync.rawData.symbol[this.props.symbol]
        if (仓位数量 !== 0) {
            return <span><span style={{ color: 仓位数量 < 0 ? RED : GREEN }}>{仓位数量}</span>@<span>{开仓均价}</span></span>
        } else {
            return undefined
        }
    }

    render() {
        const { 仓位数量 } = orderClient.jsonSync.rawData.symbol[this.props.symbol]
        const 下单数量 = account.交易[this.props.symbol].数量 * this.props.倍数

        return <div>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'left',
                margin: '20px 0'
            }}>
                <p style={{ color: this.props.symbol === 'XBTUSD' ? '#cc66ff' : '#aaaa00' }}>{this.props.symbol} {仓位数量 !== 0 ? <a
                    href='#'
                    style={{ color: RED }}
                    onClick={() => rpc.市价平仓({ cookie, symbol: this.props.symbol })}
                >市价平仓</a> : undefined} </p>
                <p>仓位:{this.get仓位()}</p>
                <p>止损:{this.get止损()}</p>
                <p>委托:{this.get委托()}</p>
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
                        text={下单数量 + ' 买' + (this.props.位置 + 1)}
                        left={() => rpc.下单({
                            cookie,
                            symbol: this.props.symbol,
                            type: 'maker',
                            side: 'Buy',
                            size: 下单数量,
                            位置: this.props.位置,
                            最低_最高: false,
                        })}
                        right={() => rpc.下单({
                            cookie,
                            symbol: this.props.symbol,
                            type: 'taker',
                            side: 'Buy',
                            size: 下单数量,
                            位置: this.props.位置,
                            最低_最高: false,
                        })}
                    />

                    <br />

                    <Button
                        bgColor={GREEN}
                        text={'5秒最低 买' + (this.props.位置 + 1)}
                        left={() => rpc.下单({
                            cookie,
                            symbol: this.props.symbol,
                            type: 'maker',
                            side: 'Buy',
                            size: 下单数量,
                            位置: this.props.位置,
                            最低_最高: true,
                        })}
                        right={() => rpc.下单({
                            cookie,
                            symbol: this.props.symbol,
                            type: 'taker',
                            side: 'Buy',
                            size: 下单数量,
                            位置: this.props.位置,
                            最低_最高: true,
                        })}
                    />
                    <br />
                </div>
                <div
                    style={{
                        width: '50%'
                    }}>
                    <Button
                        bgColor={RED}
                        text={-下单数量 + ' 卖' + (this.props.位置 + 1)}
                        left={() => rpc.下单({
                            cookie,
                            symbol: this.props.symbol,
                            type: 'maker',
                            side: 'Sell',
                            size: 下单数量,
                            位置: this.props.位置,
                            最低_最高: false,
                        })}
                        right={() => rpc.下单({
                            cookie,
                            symbol: this.props.symbol,
                            type: 'taker',
                            side: 'Sell',
                            size: 下单数量,
                            位置: this.props.位置,
                            最低_最高: false,
                        })}
                    />
                    <br />
                    <Button
                        bgColor={RED}
                        text={'5秒最高 卖' + (this.props.位置 + 1)}
                        left={() => rpc.下单({
                            cookie,
                            symbol: this.props.symbol,
                            type: 'maker',
                            side: 'Sell',
                            size: 下单数量,
                            位置: this.props.位置,
                            最低_最高: true,
                        })}
                        right={() => rpc.下单({
                            cookie,
                            symbol: this.props.symbol,
                            type: 'taker',
                            side: 'Sell',
                            size: 下单数量,
                            位置: this.props.位置,
                            最低_最高: true,
                        })}
                    />
                    <br />
                </div>
            </div>
        </div >
    }
}



export class 交易 extends React.Component {


    //state
    位置 = 0
    倍数 = 1
    hopexCookie = ''


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

            if (e.keyCode === 37) {//left
                if (this.位置 > 0) this.位置--
            }

            if (e.keyCode === 39) {//right
                if (this.位置 < 4) this.位置++
            }

        })
    }



    render() {
        return orderClient.isConnected === false ?
            <a href='#' onClick={() => location.reload()}><h1>连接中_点击刷新</h1></a> :
            <div style={{
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
                <h3>只做摸顶抄底</h3>
                <hr />
                <h3>大波动 变 小波动 视觉误差</h3>
                <hr />
                <Item symbol='XBTUSD' 位置={this.位置} 倍数={this.倍数} />
                <hr />

                <br />
                <br />
                <a
                    style={{ color: 'yellow' }}
                    href='#'
                    onClick={() => {
                        dialog.showInput({ title: '设置 hopex cookie', value: this.hopexCookie, onOK: v => this.hopexCookie = v })
                    }}>{this.hopexCookie !== '' ? '已设置' : 'hopex 设置 cookie'}</a>
                <br />
                <br />

                <div>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'center'
                    }}>
                        <div
                            style={{ width: '50%' }}>
                            <Button
                                bgColor={GREEN}
                                text={(config.hopex数量 || 0) * this.倍数 + ''}
                                left={() =>
                                    hopex市价开仓BTC(this.hopexCookie, {
                                        size: (config.hopex数量 || 0) * this.倍数,
                                        side: 'Buy',
                                    })}
                            />
                        </div>
                        <div
                            style={{
                                width: '50%'
                            }}>
                            <Button
                                bgColor={RED}
                                text={-(config.hopex数量 || 0) * this.倍数 + ''}
                                left={() => hopex市价开仓BTC(this.hopexCookie, {
                                    size: (config.hopex数量 || 0) * this.倍数,
                                    side: 'Sell',
                                })}
                            />
                        </div>
                    </div>
                </div >
            </div>
    }

}


const hopex市价开仓BTC = (cookie: string, p: { size: number, side: BaseType.Side }) =>
    JSONRequest<boolean>({
        url: 'https://www.hopex.com/api/v1/gateway/User/Order',
        method: 'POST',
        body: {
            'param': {
                'side': p.side === 'Sell' ? '1' : '2',
                'orderQuantity': p.size,
                'source': '浏览器，我是市价测试单,用户id：undefined,邮箱：undefined',
                'market': 'BTCUSDT',
                'marketCode': 'BTCUSDT',
                'contractCode': 'BTCUSDT',
                'lang': 'cn'
            }
        },
        ss: config.ss,
        headers: {
            Origin: 'https://www.hopex.com',
            Referer: 'https://www.hopex.com/trade?marketCode=BTCUSDT',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36',
            conversionCurrency: 'USD',
            Authorization: cookie.split('=')[1],
            Cookie: cookie,
        }
    })  