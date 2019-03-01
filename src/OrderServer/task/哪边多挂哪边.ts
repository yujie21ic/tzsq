import { TradeAccount } from '../../统一接口/TradeAccount'
import { lastNumber } from '../../lib/F/lastNumber' 


export const 哪边多挂哪边 = () => async (self: TradeAccount) => {
    const 盘口买 = lastNumber(TradeAccount.realData.dataExt.XBTUSD.期货.盘口买)
    const 盘口卖 = lastNumber(TradeAccount.realData.dataExt.XBTUSD.期货.盘口卖)
    const nowSide = 盘口买 > 盘口卖 ? 'Buy' : 'Sell'

    const arr = [
        {
            orderList: self.活动委托['XBTUSD'].filter(v => v.type === '限价' && v.side === 'Buy'),
            side: 'Buy' as 'Buy',
        },
        {
            orderList: self.活动委托['XBTUSD'].filter(v => v.type === '限价' && v.side === 'Sell'),
            side: 'Sell' as 'Sell',
        },
    ]

    const getPrice = () => TradeAccount.realData.getOrderPrice({
        symbol: 'XBTUSD',
        side: nowSide,
        type: 'maker',
        位置: 0,
    })

    for (let i = 0; i < arr.length; i++) {
        const { orderList, side } = arr[i]
        if (orderList.length === 0 && side === nowSide) {
            return await self.bitMEXOrderAPI.maker({
                symbol: 'XBTUSD',
                side: nowSide,
                size: 1,
                price: getPrice,
                text: '挂单',
                reduceOnly: false,
            }, '', self.ws)
        }
        else if (orderList.length === 1 && side === nowSide) {
            if (orderList[0].price !== getPrice()) {
                return self.bitMEXOrderAPI.updateMaker({
                    orderID: orderList[0].id,
                    price: getPrice,
                    text: '改单',
                })
            }

        }
        else if (orderList.length > 0) {
            return self.bitMEXOrderAPI.cancel({
                orderID: orderList.map(v => v.id),
                text: '撤单'
            })
        }
    }
    return false
}