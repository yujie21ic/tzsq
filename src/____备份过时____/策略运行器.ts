// import { reverse, last } from 'ramda'
// import * as f from '../lib/IOF'
// import { BitmexAPIType, createBitmexAPI } from '../WebService/BitmexAPI'

// const toIndex = (cycle: KLineCycle, t: number) =>
//     Math.floor(t / 1000 / { '1m': 60, '5m': 60 * 5, '1h': 60 * 60, '1d': 60 * 60 * 24 }[cycle])
// export class 策略运行器 {
//     bmAPI: BitmexAPIType
//     constructor(symbol: BitmexSymbol, cookie: string) {
//         this.symbol = symbol
//         this.bmAPI = createBitmexAPI(cookie)
//     }

//     get rest() {
//         return this.bmAPI.rest
//     }

//     readonly symbol: BitmexSymbol
//     onStep = (_: 策略运行器) => { }
//     lastFillTime = 0
//     lastFillSide = '' as Side
//     lastFillPrice = 0

//     //NaN 判断 != 用
//     lastPrice = NaN //最新价
//     myPosition = NaN //我的仓位 负数为空仓
//     开仓均价 = NaN //开仓价格
//     buy1 = NaN
//     sell1 = NaN

//     buyList: { price: number, size: number }[] = []
//     sellList: { price: number, size: number }[] = []

//     //盈亏点数
//     get loseWinPoints() {
//         if (this.myPosition > 0) {
//             return this.lastPrice - this.开仓均价
//         } else if (this.myPosition < 0) {
//             return this.开仓均价 - this.lastPrice
//         } else {
//             return 0
//         }
//     }

//     //盈亏百分比
//     get loseWinPercentage() {
//         if (this.myPosition > 0) {
//             return (this.lastPrice - this.开仓均价) / this.开仓均价
//         } else if (this.myPosition < 0) {
//             return (this.开仓均价 - this.lastPrice) / this.开仓均价
//         } else {
//             return 0
//         }
//     }

//     活动委托: {
//         orderID: string
//         side: Side
//         orderQty: number /* format:int64 委托的合约数量*/
//         cumQty: number /* format:int64  委托已成交数量，如果委托已被完全成交，此数值将等于委托数量*/
//         price: number
//     }[] = []

//     止损委托: {
//         orderID: string
//         side: Side
//         orderQty: number /* format:int64 委托的合约数量*/
//         cumQty: number /* format:int64  委托已成交数量，如果委托已被完全成交，此数值将等于委托数量*/
//         price: number
//     }[] = []

//     //行情    
//     protected historyData: {
//         [k: string]: {
//             kline: KLineItem[]
//             rsi: (number | undefined)[]
//         }
//     } = {
//             '1m': { kline: [], rsi: [] },
//             '5m': { kline: [], rsi: [] },
//             '1h': { kline: [], rsi: [] },
//             '1d': { kline: [], rsi: [] },
//         }


//     getHistoryData(cycle: KLineCycle) {
//         return this.historyData[cycle]
//     }

//     marketOrder(side: Side, count: number) {
//         this.仓位改变中 = true
//         f.log.info(`市价${side} ${count}`)
//         this.rest.Order.new({
//             symbol: this.symbol,
//             side: side,
//             ordType: 'Market',
//             orderQty: count
//         }).then(
//             () => f.log.success(`市价${side} ${count} 成功`)
//         ).catch(error => {
//             this.仓位改变中 = false
//             f.log.error(`市价${side} ${count} 失败:` + error)
//         })
//     }

//     order(orders: { side: Side, price: number, count: number }[], reduceOnly = false) {//reduceOnly只减仓
//         const arr = orders.filter(v => v.count != 0)
//         if (arr.length != 0) {
//             this.批量委托中 = true
//             f.log.info(`批量委托${arr.length}个 ${JSON.stringify(orders)}`)
//             this.rest.Order.newBulk({
//                 orders: JSON.stringify(
//                     arr.map(v => ({
//                         symbol: this.symbol,
//                         side: v.side,
//                         price: v.price,
//                         orderQty: v.count,
//                         execInst: reduceOnly ? 'ParticipateDoNotInitiate,ReduceOnly' : 'ParticipateDoNotInitiate'
//                     }))
//                 )
//             }).then(
//                 () => f.log.success(`批量委托 成功`)
//             ).catch(error => {
//                 this.批量委托中 = false
//                 f.log.error(`批量委托 失败` + error)
//             })
//         }
//     }

//     order止损(orders: { side: Side, price: number, count: number }[]) {
//         const arr = orders.filter(v => v.count != 0)
//         if (arr.length != 0) {
//             this.批量止损中 = true
//             f.log.info(`批量止损${arr.length}个 ${JSON.stringify(orders)}`)
//             this.rest.Order.newBulk({
//                 orders: JSON.stringify(
//                     arr.map(v => ({
//                         symbol: this.symbol,
//                         side: v.side,
//                         stopPx: v.price,
//                         orderQty: v.count,
//                         ordType: 'Stop',
//                         execInst: 'Close,LastPrice'
//                     }))
//                 )
//             }).then(
//                 () => f.log.success(`批量止损 成功`)
//             ).catch(error => {
//                 this.批量止损中 = false
//                 f.log.error(`止损委托 失败:` + error)
//             })
//         }
//     }


//     lastCancelIds: string[] = []
//     orderCancel(p: string[]) {
//         if (p.length != 0) {
//             this.lastCancelIds = p
//             this.批量取消中 = true
//             f.log.info(`批量取消${p.length}个 ${JSON.stringify(p)}`)
//             this.rest.Order.cancel({
//                 orderID: JSON.stringify(p)
//             }).then(
//                 () => f.log.success(`批量取消 成功`)
//             ).catch(error => {
//                 this.批量取消中 = false
//                 f.log.error(`批量取消 失败:` + error)
//             })
//         }
//     }


//     logAll() {
//         // console.log(JSON.stringify([
//         //     this.批量取消中,
//         //     this.批量委托中,
//         //     this.批量止损中,
//         //     this.仓位改变中
//         // ]))
//     }

//     //api 锁定 step
//     _批量取消中 = false
//     get 批量取消中() { return this._批量取消中 }
//     set 批量取消中(b: boolean) {
//         this._批量取消中 = b
//         this.logAll()
//     }

//     _批量委托中 = false
//     get 批量委托中() { return this._批量委托中 }
//     set 批量委托中(b: boolean) {
//         this._批量委托中 = b
//         this.logAll()
//     }

//     _批量止损中 = false
//     get 批量止损中() { return this._批量止损中 }
//     set 批量止损中(b: boolean) {
//         this._批量止损中 = b
//         this.logAll()
//     }

//     _仓位改变中 = false
//     get 仓位改变中() { return this._仓位改变中 }
//     set 仓位改变中(b: boolean) {
//         this._仓位改变中 = b
//         this.logAll()
//     }

//     //数据未获取完全 锁定 step
//     stepCheck = {
//         myPosition: false,
//         activeOrders: false,
//         lastPrice: false,
//         orderBook10: false
//     }

//     step() {
//         const c = this.stepCheck
//         if (
//             ((this.批量委托中 || this.批量止损中 || this.仓位改变中 || this.批量取消中) == false) &&
//             ((c.myPosition && c.lastPrice && c.activeOrders && c.orderBook10) == true)
//         ) {
//             this.onStep(this)
//         }
//     }

//     async run() {
//         try {

//             console.log('start...')

//             //输出余额
//             const margin = await this.rest.User.getMargin({})
//             f.log.highlighted('总:' + margin.walletBalance.toLocaleString('en-US'))
//             f.log.highlighted('可用:' + margin.availableMargin.toLocaleString('en-US'))


//             //同步最后10根 、、10
//             for (let i = 0; i < 4; i++) {
//                 const cycle = ['1m', '5m', '1h', '1d'][i] as KLineCycle

//                 const kline = reverse(await this.rest.Trade.getBucketed({
//                     symbol: this.symbol,
//                     binSize: cycle,
//                     count: 10,
//                     reverse: true
//                 })).map(v => ({
//                     index: toIndex(cycle, new Date(v.timestamp).getTime()),
//                     open: v.open,
//                     close: v.close,
//                     high: v.high,
//                     low: v.low,
//                     volume: v.volume
//                 }))



//                 this.historyData[cycle].kline = kline
//             }

//             f.log.highlighted('ws start')

//             //开始处理
//             let ws = this.bmAPI.WSAPI

//             ws.connect()

//             ws.onopen = () => {
//                 ws.subscribe([
//                     //活动委托
//                     { theme: 'order', filter: this.symbol },
//                     //最新价
//                     { theme: 'instrument', filter: this.symbol },//出问题了
//                     { theme: 'orderBook10', filter: this.symbol },
//                     //我的仓位
//                     { theme: 'position', filter: this.symbol },
//                     //kline
//                     { theme: 'tradeBin1m', filter: this.symbol },
//                     { theme: 'tradeBin5m', filter: this.symbol },
//                     { theme: 'tradeBin1h', filter: this.symbol },
//                     { theme: 'tradeBin1d', filter: this.symbol },
//                 ])
//                 f.log.success('连接成功')
//             }

//             ws.onclose = () => {
//                 f.log.error('连接断开')
//                 setTimeout(() => ws.connect(), 100)
//             }



//             ws.onFilled = (side, price) => {
//                 f.log.success('完全成交:' + side + price)
//                 this.lastFillSide = side
//                 this.lastFillPrice = price
//                 this.lastFillTime = Date.now()
//             }

//             ws.onmessage = frame => {

//                 if (this.批量取消中 && ws.data.order.some(v => this.lastCancelIds.some(ids => v.orderID == ids)) == false) {
//                     this.批量取消中 = false
//                 }

//                 //kline
//                 if (
//                     (
//                         frame.table == 'tradeBin1m' ||
//                         frame.table == 'tradeBin5m' ||
//                         frame.table == 'tradeBin1h' ||
//                         frame.table == 'tradeBin1d'
//                     )
//                     &&
//                     (frame.action == 'partial' || frame.action == 'insert')
//                     &&
//                     (frame.data.length > 0)
//                 ) {
//                     const cycle = {
//                         tradeBin1m: '1m',
//                         tradeBin5m: '5m',
//                         tradeBin1h: '1h',
//                         tradeBin1d: '1d'
//                     }[frame.table] as KLineCycle

//                     const v = frame.data[0]

//                     const index = toIndex(cycle, new Date(v.timestamp).getTime())

//                     const lastItem = last(this.historyData[cycle].kline)

//                     if (lastItem != undefined && index != lastItem.index) {

//                         this.historyData[cycle].kline.push({
//                             index: index,
//                             open: v.open,
//                             close: v.close,
//                             high: v.high,
//                             low: v.low,
//                             volume: v.volume
//                         })

//                         this.step()
//                     }
//                 }
//                 //活动委托
//                 else if (frame.table == 'order') {

//                     // f.log.info(JSON.stringify(frame, null, 4))

//                     //insert  ordStatus: 'New',
//                     //成功  update  workingIndicator: false,  --> true
//                     //失败  update  ordStatus: 'New'  --> ordStatus: 'Rejected'

//                     //取消成功  update  ordStatus: 'Canceled',
//                     //取消成功  update  ordStatus: 'Filled', 已成交

//                     //服务器先返回的 委托改变 再返回的 仓位改变
//                     // if (frame.data.find(v =>
//                     //     v.ordStatus == 'Filled' ||
//                     //     v.ordStatus == 'Partially Filled' //部分成交
//                     // ) != undefined) {
//                     //     //锁定 step
//                     //     this.仓位改变中 = true
//                     //     f.log.success('仓位改变中 = true')
//                     // }

//                     if (frame.data.find(v => v.ordType == 'Limit') != undefined) {
//                         this.批量委托中 = false
//                     }

//                     if (frame.data.find(v => v.ordType == 'Stop') != undefined) {
//                         this.批量止损中 = false
//                     }

//                     this.活动委托 = ws.data.order.filter(v => v.ordType == 'Limit').map(v => ({
//                         orderID: v.orderID,
//                         side: v.side as Side,
//                         orderQty: v.orderQty,
//                         cumQty: v.cumQty,
//                         price: v.price
//                     }))

//                     console.log('活动委托 update', JSON.stringify(this.活动委托, null, 4))

//                     this.止损委托 = ws.data.order.filter(v => v.ordType == 'Stop').map(v => ({
//                         orderID: v.orderID,
//                         side: v.side as Side,
//                         orderQty: v.orderQty,
//                         cumQty: v.cumQty,
//                         price: v.price
//                     }))

//                     this.stepCheck.activeOrders = true
//                     this.step()
//                 }
//                 //最新价 
//                 else if (frame.table == 'orderBook10') {
//                     this.buy1 = ws.data.orderBook10[0].bids[0][0]
//                     this.sell1 = ws.data.orderBook10[0].asks[0][0]
//                     this.buyList = ws.data.orderBook10[0].bids.map(v => ({
//                         price: v[0],
//                         size: v[1]
//                     }))
//                     this.sellList = ws.data.orderBook10[0].asks.map(v => ({
//                         price: v[0],
//                         size: v[1]
//                     }))

//                     this.stepCheck.orderBook10 = true
//                     this.step()
//                 }
//                 else if (frame.table == 'instrument') {
//                     if (ws.data.instrument.length > 0) {
//                         const { lastPrice } = ws.data.instrument[0]
//                         this.lastPrice = lastPrice
//                         this.stepCheck.lastPrice = true
//                         this.step()
//                     }
//                 }
//                 //我的仓位
//                 else if (frame.table == 'position') {
//                     if (ws.data.position.length > 0) {

//                         const { currentQty, avgCostPrice } = ws.data.position[0]

//                         if (this.myPosition != currentQty) {
//                             this.myPosition = currentQty == null ? 0 : currentQty
//                             this.开仓均价 = avgCostPrice == null ? 0 : avgCostPrice
//                             this.仓位改变中 = false
//                             console.log(`仓位数量:${this.myPosition} 开仓均价:${this.开仓均价}`, `${this.symbol}.txt`)
//                             this.stepCheck.myPosition = true
//                             this.step()
//                         }

//                     } else {
//                         this.myPosition = 0
//                         this.开仓均价 = 0
//                         this.仓位改变中 = false
//                         console.log(`仓位数量:${this.myPosition} 开仓均价:${this.开仓均价}`, `${this.symbol}.txt`)
//                         this.stepCheck.myPosition = true
//                         this.step()
//                     }
//                 }
//             }
//         }
//         catch (err) {
//             f.log.error('运行失败' + JSON.stringify(err))
//         }
//     }
// }