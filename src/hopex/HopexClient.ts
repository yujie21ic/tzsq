import { mapObjIndexed } from 'ramda'
import { BaseType } from '../lib/BaseType'
import { HopexHTTP } from './HopexHTTP'
import { sleep } from '../lib/F/sleep'

export class HopexClient {

    hopex_初始化 = {
        仓位: false,
        委托: false,
    }

    hopexCookie = ''

    constructor() {
        this.hopex_轮询()
    }

    private async hopex_仓位_轮询() {
        while (true) {
            const __obj__ = mapObjIndexed(() => ({ 仓位数量: 0, 开仓均价: 0, }), BaseType.HopexSymbolDic)
            const { data } = await HopexHTTP.getPositions(this.hopexCookie)
            if (data !== undefined) {
                this.hopex_初始化.仓位 = true

                const arr = data.data || []
                arr.forEach(v => {
                    if (__obj__[v.contractCode] !== undefined) {//!!!!!!!!!!!!!!!!!!!!!!
                        __obj__[v.contractCode].仓位数量 = Number(v.positionQuantity.split(',').join(''))
                        __obj__[v.contractCode].开仓均价 = v.entryPriceD
                    }
                })

                BaseType.HopexSymbolArr.forEach(symbol => {
                    if (this.jsonSync.rawData.market.hopex[symbol].仓位数量 !== __obj__[symbol].仓位数量) {
                        this.jsonSync.data.market.hopex[symbol].仓位数量.____set(__obj__[symbol].仓位数量)
                        this.log(`hopex ${symbol} 仓位数量: + ${__obj__[symbol].仓位数量}`)
                    }
                    if (this.jsonSync.rawData.market.hopex[symbol].开仓均价 !== __obj__[symbol].开仓均价) {
                        this.jsonSync.data.market.hopex[symbol].开仓均价.____set(__obj__[symbol].开仓均价)
                        this.log(`hopex ${symbol} 开仓均价: + ${__obj__[symbol].开仓均价}`)
                    }
                })

            } else {
                this.hopex_初始化.仓位 = false
                this.log('hopex_初始化.仓位 = false')
            }
            await sleep(1000)
        }
    }

    private async hopex_委托_轮询() {
        while (true) {
            const __obj__ = mapObjIndexed(() => [] as BaseType.Order[], BaseType.HopexSymbolDic)
            const 止损data = (await HopexHTTP.getConditionOrders(this.hopexCookie)).data
            const 委托data = (await HopexHTTP.getOpenOrders(this.hopexCookie)).data

            if (止损data !== undefined && 委托data !== undefined) {
                this.hopex_初始化.委托 = true

                if (止损data.data !== undefined) {
                    const result = 止损data.data ? 止损data.data.result || [] : []
                    result.forEach(v => {
                        if (v.taskStatusD === '未触发') {
                            if (__obj__[v.contractCode] !== undefined)
                                __obj__[v.contractCode].push({
                                    type: '止损',
                                    timestamp: v.timestamp,
                                    id: String(v.taskId),
                                    side: v.taskTypeD === '买入止损' ? 'Buy' : 'Sell',
                                    cumQty: 0,
                                    orderQty: 100000,
                                    price: Number(v.trigPrice.split(',').join('')),
                                })
                        }
                    })
                }
                if (委托data.data !== undefined) {
                    委托data.data.forEach(v => {
                        if (__obj__[v.contractCode] !== undefined)
                            __obj__[v.contractCode].push({
                                type: '限价',
                                timestamp: new Date(v.ctime).getTime(),
                                id: String(v.orderId),
                                side: v.side === '2' ? 'Buy' : 'Sell',
                                cumQty: Number(v.fillQuantity.split(',').join('')),
                                orderQty: Number(v.leftQuantity.split(',').join('')),
                                price: Number(v.orderPrice.split(',').join('')),
                            })
                    })
                }

                BaseType.HopexSymbolArr.forEach(symbol => {
                    const id1Arr = __obj__[symbol].map(v => v.id).sort().join(',')
                    const id2Arr = this.jsonSync.rawData.market.hopex[symbol].委托列表.map(v => v.id).sort().join(',')

                    if (id1Arr !== id2Arr) {
                        this.jsonSync.data.market.hopex[symbol].委托列表.____set(__obj__[symbol])
                        this.log('hopex ' + symbol + '止损:' + (__obj__[symbol].length > 0 ? __obj__[symbol][0].price : '无'))
                    }
                })

            } else {
                this.hopex_初始化.委托 = false
                this.log('hopex_初始化.委托 = false')
            }
            await sleep(1000)
        }
    }


    private async hopex_轮询() {
        this.hopex_仓位_轮询()
        this.hopex_委托_轮询()
    }

}