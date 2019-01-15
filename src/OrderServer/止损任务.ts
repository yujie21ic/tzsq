// import { BaseType } from '../lib/BaseType'

// const get止损成本价 = (p: { side: BaseType.Side, price: number, gridPoint: number }) => {
//     if (p.side === 'Buy') {
//         const ret = Math.floor(p.price / p.gridPoint) * p.gridPoint
//         if (ret === p.price) {
//             return ret - p.gridPoint
//         } else {
//             return ret
//         }
//     } else {
//         const ret = Math.floor(p.price / p.gridPoint + 1) * p.gridPoint
//         if (ret === p.price) {
//             return ret + p.gridPoint
//         } else {
//             return ret
//         }
//     }
// }

// get止损成本价(symbol: BaseType.BitmexSymbol) {
//     const item = this.get仓位(symbol)
//     if (item === undefined) return NaN

//     const { 仓位数量, 开仓均价 } = item

//     return get止损成本价({
//         side: 仓位数量 > 0 ? 'Sell' : 'Buy',
//         price: 开仓均价,
//         gridPoint: symbol === 'ETHUSD' ? 0.05 : 0.5
//     })
// }








// const nowPrice = () => realData.getOrderPrice(p.symbol, p.side, p.type)

// const side = p.side === 'Buy' ? 'Sell' : 'Buy'

// let 止损点 = p.止损点

// const item = realData.dataExt[p.symbol as 'XBTUSD']

// if (止损点 === 0 && item !== undefined) {
//     止损点 = Math.max(lastNumber(item.期货.波动率) / 15, 3)
//     const gridPoint = p.symbol === 'ETHUSD' ? 0.05 : 0.5
//     止损点 = Math.floor(止损点 / gridPoint) * gridPoint
// }

// return await BitMEXOrderAPI.stop(cookie, {
//     symbol: p.symbol,
//     side,
//     price: () => nowPrice() + 止损点 * (side === 'Buy' ? 1 : -1),
// })