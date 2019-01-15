// const 只减仓 = async (
//     cookie: string,
//     p: {
//         symbol: BaseType.BitmexSymbol
//         side: BaseType.Side
//         size: number
//     }
// ) => await BitMEXOrderAPI.reduceOnly(cookie, {
//     ...p,
//     price: () => realData.getOrderPrice(p.symbol, p.side, 'maker')
// })

// async 平仓回合(symbol2: BaseType.BitmexSymbol) {
//     const symbol = symbol2 as 'XBTUSD'

//     if (this.ws.isConnected === false) return //ws 断开了 
//     if (this.有委托(symbol) === false && this.get仓位(symbol) === undefined) return //没有委托和仓位 
//     if (this.有委托(symbol) && this.get仓位(symbol) === undefined) { //有委托没仓位
//         await BitMEXOrderAPI.cancelAll(this.cookie, symbol)
//         return
//     }

//     if (this.jsonSync.rawData.symbol[symbol] === undefined) {
//         return '找不到 symbol'
//     }

//     if (this.jsonSync.rawData.symbol[symbol].状态 !== '--') {
//         return '不是 -- '
//     }
//     this.jsonSync.data.symbol[symbol].状态.____set('平仓中')


//     //

//     if (isNaN(this.get当前止损价格(symbol))) {
//         this.jsonSync.data.symbol[symbol].msg.____set('没有止损  10点止损')
//         const 止损价 = this.get止损成本价(symbol) + (this.get止损side(symbol) === 'Buy' ? 10 : -10)
//         await BitMEXOrderAPI.stop(this.cookie, {
//             symbol,
//             side: this.get止损side(symbol),
//             price: () => 止损价
//         })
//         await sleep(2000)//等ws回止损
//     }
//     else if (this.get浮盈点数(symbol) >= 10) {
//         const 止损价 = this.get止损成本价(symbol) + (this.get止损side(symbol) === 'Buy' ? -3 : 3)
//         if (止损价 !== this.get当前止损价格(symbol)) {
//             this.jsonSync.data.symbol[symbol].msg.____set('浮盈大于10点 止损挪到成交价+3浮盈价')
//             await BitMEXOrderAPI.cancelAll(this.cookie, symbol)
//             await BitMEXOrderAPI.stop(this.cookie, {
//                 symbol,
//                 side: this.get止损side(symbol),
//                 price: () => 止损价
//             })
//             //不用等

//             //同时期货走平3秒开始挂单成交 ????????
//             const xxxxxx = this.get仓位(symbol)
//             if (xxxxxx !== undefined) {
//                 if (await 期货走平X({
//                     symbol,
//                     side: this.get止损side(symbol),
//                     超时秒: 10,
//                     走平秒: 3,
//                     偏移: 0,
//                 })) {
//                     this.jsonSync.data.symbol[symbol].msg.____set('浮盈大于10点 止损挪到成交价+3浮盈价 同时期货走平3秒开始挂单成交')
//                     只减仓(this.cookie, {
//                         symbol,
//                         side: this.get止损side(symbol),
//                         size: Math.abs(xxxxxx.仓位数量)
//                     })
//                     await sleep(2000)//等ws 
//                 }
//             }
//         }
//     }
//     else if (this.get浮盈点数(symbol) >= 5) {
//         const 止损价 = this.get止损成本价(symbol)
//         if (止损价 !== this.get当前止损价格(symbol)) {
//             this.jsonSync.data.symbol[symbol].msg.____set('浮盈大于5点  止损挪到成交价 ')
//             await BitMEXOrderAPI.cancelAll(this.cookie, symbol)
//             await BitMEXOrderAPI.stop(this.cookie, {
//                 symbol,
//                 side: this.get止损side(symbol),
//                 price: () => 止损价
//             })
//             await sleep(2000)//等ws回止损
//         }
//     }


//     return ''
// }