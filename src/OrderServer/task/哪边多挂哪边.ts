import { TradeAccount } from '../TradeAccount'
import { lastNumber } from '../../lib/F/lastNumber'
import { realData } from '../realData'


export const 哪边多挂哪边 = () => async (self: TradeAccount) => {
    const 盘口买 = lastNumber(realData.dataExt.XBTUSD.期货.盘口买)
    const 盘口卖 = lastNumber(realData.dataExt.XBTUSD.期货.盘口卖)
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

    const getPrice = () => realData.getOrderPrice({
        symbol: 'XBTUSD',
        side: nowSide,
        type: 'maker',
        位置: 0,
    })

    for (let i = 0; i < arr.length; i++) {
        const { orderList, side } = arr[i]
        if (orderList.length === 0 && side === nowSide) {
            console.log('挂单' + nowSide)
            return await self.order自动.maker({
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
                //     console.log('改单' + nowSide)
                //     return self.order自动.updateMaker({
                //         orderID: orderList[0].id,
                //         price: getPrice,
                //         text: '改单',
                //     })
                console.log('撤单' + nowSide)
                return self.order自动.cancel({
                    orderID: orderList.map(v => v.id),
                    text: '撤单'
                })
            }

        }
        else if (orderList.length > 0) {
            console.log('撤单' + nowSide)
            return self.order自动.cancel({
                orderID: orderList.map(v => v.id),
                text: '撤单'
            })
        }
    }
    return false
}