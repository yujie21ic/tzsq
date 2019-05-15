import { mapObjIndexed } from 'ramda'
import { BaseType } from '../lib/BaseType'
import { HopexHTTP } from './HopexHTTP'
import { sleep } from '../lib/F/sleep'

export class HopexClient {

    初始化 = {
        仓位: false,
        //委托: false,
    }

    symbol = mapObjIndexed(() => ({
        仓位数量: 0,
        开仓均价: 0,
    }), BaseType.HopexSymbolDic)

    权益 = ''

    private cookie = ''

    constructor(cookie: string) {
        this.cookie = cookie
        this.轮询()
    }

    private async 仓位_轮询() {
        while (true) {
            const { data } = await HopexHTTP.getPositions(this.cookie)
            if (data !== undefined) {
                this.初始化.仓位 = true
                const arr = data.data || []
                arr.forEach(v => {
                    if (this.symbol[v.contractCode] !== undefined) {
                        this.symbol[v.contractCode].仓位数量 = Number(v.positionQuantity.split(',').join(''))
                        this.symbol[v.contractCode].开仓均价 = v.entryPriceD
                    }
                })
            } else {
                this.初始化.仓位 = false
            }
            await sleep(1000)
        }
    }

    private async 权益_轮询() {
        while (true) {
            const { data } = await HopexHTTP.get权益(this.cookie)
            if (data !== undefined) {
                if (data.data !== undefined && data.data.detail !== undefined) {
                    data.data.detail.forEach(v => {
                        if (v.assetName === 'USDT') {
                            this.权益 = Number(v.totalWealthLegal.replace('USD', '')).toFixed(2)
                        }
                    })
                }
            } else {
                this.初始化.仓位 = false
            }
            await sleep(1000)
        }
    }

    // private async 委托_轮询() {
    //     while (true) {
    //         const __obj__ = mapObjIndexed(() => [] as BaseType.Order[], BaseType.HopexSymbolDic)
    //         const 止损data = (await HopexHTTP.getConditionOrders(this.cookie)).data
    //         const 委托data = (await HopexHTTP.getOpenOrders(this.cookie)).data

    //         if (止损data !== undefined && 委托data !== undefined) {
    //             this.初始化.委托 = true

    //             if (止损data.data !== undefined) {
    //                 const result = 止损data.data ? 止损data.data.result || [] : []
    //                 result.forEach(v => {
    //                     if (v.taskStatusD === '未触发') {
    //                         if (__obj__[v.contractCode] !== undefined)
    //                             __obj__[v.contractCode].push({
    //                                 type: '止损',
    //                                 timestamp: v.timestamp,
    //                                 id: String(v.taskId),
    //                                 side: v.taskTypeD === '买入止损' ? 'Buy' : 'Sell',
    //                                 cumQty: 0,
    //                                 orderQty: 100000,
    //                                 price: Number(v.trigPrice.split(',').join('')),
    //                             })
    //                     }
    //                 })
    //             }
    //             if (委托data.data !== undefined) {
    //                 委托data.data.forEach(v => {
    //                     if (__obj__[v.contractCode] !== undefined)
    //                         __obj__[v.contractCode].push({
    //                             type: '限价',
    //                             timestamp: new Date(v.ctime).getTime(),
    //                             id: String(v.orderId),
    //                             side: v.side === '2' ? 'Buy' : 'Sell',
    //                             cumQty: Number(v.fillQuantity.split(',').join('')),
    //                             orderQty: Number(v.leftQuantity.split(',').join('')),
    //                             price: Number(v.orderPrice.split(',').join('')),
    //                         })
    //                 })
    //             }

    //             BaseType.HopexSymbolArr.forEach(symbol => {
    //                 const id1Arr = __obj__[symbol].map(v => v.id).sort().join(',')
    //                 const id2Arr = this.jsonSync.rawData.market.hopex[symbol].委托列表.map(v => v.id).sort().join(',')

    //                 if (id1Arr !== id2Arr) {
    //                     this.jsonSync.data.market.hopex[symbol].委托列表.____set(__obj__[symbol])
    //                     this.log('hopex ' + symbol + '止损:' + (__obj__[symbol].length > 0 ? __obj__[symbol][0].price : '无'))
    //                 }
    //             })

    //         } else {
    //             this.初始化.委托 = false
    //             this.log('初始化.委托 = false')
    //         }
    //         await sleep(1000)
    //     }
    // }


    private async 轮询() {
        this.仓位_轮询()
        this.权益_轮询()
        // this.委托_轮询()
    }

}