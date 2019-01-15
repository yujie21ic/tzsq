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