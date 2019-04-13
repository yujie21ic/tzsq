//全局类型

type KLineItem = {
    index: number
    open: number
    close: number
    high: number
    low: number
    volume: number
}

type KLineCycle = '1m' | '5m' | '1h' | '1d'

type BinanceSymbol = 'btcusdt' | 'ethusdt'
type BitmexSymbol = 'ETHUSD' | 'XBTUSD' | 'BCHZ18' | 'ADAM18' | 'BCHM18' | 'ETHM18' | 'LTCM18' | 'XBTU18' | 'XRPU18' | 'XRPZ18' | 'XBTM18'

type Side = 'Buy' | 'Sell'



type AAAA = {
    网格点: (n: number) => number //n是距离   没算累计
    格数: number
    重挂时间: number
    数量: (n: number) => number//n是仓位数量   算了累计
    buy条件: (p: {
        仓位数量: number
        价格: number
        开仓均价: number
    }) => boolean
    sell条件: (p: {
        仓位数量: number
        价格: number
        开仓均价: number
    }) => boolean
}

type SuperGridConfig = {
    价钱除以多少: number
    加仓: AAAA
    减仓: AAAA
    多仓: {
        min: number
        max: number
    }
    空仓: {
        min: number
        max: number
    }
    退出程序: (p: {
        仓位数量: number
        价格: number
        开仓均价: number
    }) => boolean
}

type RealType = {
    config: {
        cookie: string
        symbol: BitmexSymbol
    }
    ploy: SuperGridConfig
}

declare const real: RealType



import { getGridPrice } from './getGridPrice'
import * as electron from 'electron'

let api: 策略运行器
let superGridConfig: SuperGridConfig

const get加仓数量 = (累计: number) => superGridConfig.加仓.数量(累计 + Math.abs(api.myPosition))

const get减仓数量 = (累计: number) => superGridConfig.减仓.数量(累计 + Math.abs(api.myPosition))


//
const get开仓均价 = () => Math.round(api.开仓均价 * superGridConfig.价钱除以多少)
const getLastFillPrice = () => Math.round(api.lastFillPrice * superGridConfig.价钱除以多少)
const getLastPrice = () => Math.round(api.lastPrice * superGridConfig.价钱除以多少)
const getBuy1 = () => Math.round(api.buy1 * superGridConfig.价钱除以多少)
const getSell1 = () => Math.round(api.sell1 * superGridConfig.价钱除以多少)

const __getPrice = (side: Side, 网格点: number, _price_?: number, 必须盈利 = true) => {
    // console.log(side, '必须盈利', 必须盈利)
    if (side == 'Buy') {
        const arr = [_price_, getSell1(), ...[必须盈利 ? [get开仓均价()] : []]].filter(v => v != 0 && v != undefined) as number[]
        let price = Math.min(...arr)

        //多仓.最大价格 删除

        return getGridPrice({
            side: 'Buy',
            price: price,
            gridPoint: 网格点
        })
    } else {
        const arr = [_price_, getBuy1(), ...[必须盈利 ? [get开仓均价()] : []]].filter(v => v != 0 && v != undefined) as number[]
        let price = Math.max(...arr)

        //空仓.最小价格 删除

        return getGridPrice({
            side: 'Sell',
            price: price,
            gridPoint: 网格点
        })
    }
}

const getPrice = (side: Side, 网格点: number, 重挂时间: number, 必须盈利: boolean) => {
    let p = __getPrice(side, 网格点, undefined, 必须盈利)

    //重挂时间内
    if (api.lastFillSide == side &&
        (
            (side == 'Buy' && p >= getLastFillPrice()) ||
            (side == 'Sell' && p <= getLastFillPrice())
        ) &&
        Date.now() < api.lastFillTime + 重挂时间 * 1000
    ) {
        p = __getPrice(side, 网格点, getLastFillPrice(), 必须盈利)
    }

    return p
}

const getOrderArr = (side: Side, 网格点: number, 格数: number, 重挂时间: number) => {
    let p = getPrice(side, 网格点, 重挂时间, true)

    //多仓小于min 亏损加仓
    if (side == 'Buy' && api.myPosition > 0 && api.myPosition < superGridConfig.多仓.min) {
        p = getPrice('Buy', 网格点, 重挂时间, false)
    }

    //空仓小于min 亏损加仓 
    if (side == 'Sell' && api.myPosition < 0 && Math.abs(api.myPosition) < superGridConfig.空仓.min) {
        p = getPrice('Sell', 网格点, 重挂时间, false)
    }

    let 累计 = 0
    return range(0, 格数).map(i => {
        const price = side == 'Buy' ? p - i * 网格点 : p + i * 网格点
        let count: number
        if (side == 'Buy') {
            count = api.myPosition > 0 ? get加仓数量(累计) : get减仓数量(累计)
        } else {
            count = api.myPosition < 0 ? get加仓数量(累计) : get减仓数量(累计)
        }
        累计 += count
        return { side, price, count }
    })
}

const step = () => {

    if (superGridConfig.退出程序({
        仓位数量: api.myPosition,
        价格: getLastPrice(),
        开仓均价: get开仓均价()
    })) {
        electron.remote.getCurrentWindow().close()
        return
    }

    const 减仓距离 = get开仓均价() == 0 ? 0 : Math.abs(get开仓均价() - (api.myPosition > 0 ? getSell1() : getBuy1()))
    const 减仓 = getOrderArr(
        api.myPosition > 0 ? 'Sell' : 'Buy',
        superGridConfig.减仓.网格点(减仓距离),
        superGridConfig.减仓.格数,
        superGridConfig.减仓.重挂时间
    ).filter(v => v.side == 'Buy' ? superGridConfig.减仓.buy条件({
        仓位数量: api.myPosition,
        价格: v.price,
        开仓均价: get开仓均价()
    }) : superGridConfig.减仓.sell条件({
        仓位数量: api.myPosition,
        价格: v.price,
        开仓均价: get开仓均价()
    }))

    const 加仓距离 = get开仓均价() == 0 ? 0 : Math.abs(get开仓均价() - (api.myPosition > 0 ? getBuy1() : getSell1()))
    const 加仓 = getOrderArr(
        api.myPosition > 0 ? 'Buy' : 'Sell',
        superGridConfig.加仓.网格点(加仓距离),
        superGridConfig.加仓.格数,
        superGridConfig.加仓.重挂时间
    ).filter(v => v.side == 'Buy' ? superGridConfig.加仓.buy条件({
        仓位数量: api.myPosition,
        价格: v.price,
        开仓均价: get开仓均价()
    }) : superGridConfig.加仓.sell条件({
        仓位数量: api.myPosition,
        价格: v.price,
        开仓均价: get开仓均价()
    }))

    let arr: { side: Side, price: number, count: number }[] = []

    let count = 0
    let temp = false
    for (let i = 0; i < 减仓.length; i++) {
        count += 减仓[i].count
        //没有仓位 Buy
        if (api.myPosition == 0) {
            if (count > superGridConfig.多仓.max) break
        }
        //多仓
        if (api.myPosition > 0) {
            //不能减仓
            if (superGridConfig.多仓.min != 0 && api.myPosition < superGridConfig.多仓.min) {
                break
            }

            //减仓后不能 反手 > 最大仓位
            if (api.myPosition - count < -superGridConfig.空仓.max) {
                break
            }

            //减仓后 < 最小仓位 下一格就不减仓了
            if (superGridConfig.多仓.min != 0 && api.myPosition - count < superGridConfig.多仓.min) {
                temp = true
            }
        }
        //空仓
        if (api.myPosition < 0) {
            //不能减仓
            if (superGridConfig.空仓.min != 0 && api.myPosition > -superGridConfig.空仓.min) {
                break
            }

            //减仓后不能 反手 > 最大仓位
            if (api.myPosition + count > superGridConfig.多仓.max) {
                break
            }

            //减仓后 < 最小仓位 下一格就不减仓了
            if (superGridConfig.空仓.min != 0 && api.myPosition + count > -superGridConfig.空仓.min) {
                temp = true
            }
        }
        arr.push(减仓[i])
        if (temp) break
    }


    count = 0
    for (let i = 0; i < 加仓.length; i++) {
        count += 加仓[i].count
        //没有仓位 Sell
        if (api.myPosition == 0) {
            if (count > superGridConfig.空仓.max) break
        }
        //多仓
        if (api.myPosition > 0) {
            //加仓后不能 > 最大仓位
            if (api.myPosition + count > superGridConfig.多仓.max) {
                break
            }
        }
        //空仓
        if (api.myPosition < 0) {
            //加仓后不能 > 最大仓位
            if (api.myPosition - count < -superGridConfig.空仓.max) {
                break
            }
        }
        arr.push(加仓[i])
    }
    // console.log(JSON.stringify(arr))
    sync活动委托(arr)
}

//price 不能重复
const sync活动委托 = (arr: { side: Side, price: number, count: number }[]) => {

    let dic: { [price: number]: { side: Side, count: number } } = {}

    arr.forEach(v => {
        dic[v.price] = { side: v.side, count: v.count }
    })




    let cancelIDs: string[] = []

    api.活动委托.forEach(v => {


        const PRICE = Math.round(v.price * superGridConfig.价钱除以多少)//<--------- 

        //这个价格没有委托 取消掉
        if (dic[PRICE] == undefined) {
            cancelIDs.push(v.orderID)
        }
        // 委托数量不一样 取消掉
        else if (v.orderQty != dic[PRICE].count) {
            cancelIDs.push(v.orderID)
        }
        //委托数量一样
        else {
            delete dic[PRICE]
        }
    })


    if (cancelIDs.length != 0) {
        api.orderCancel(cancelIDs)
    } else {
        let arr: { side: Side, price: number, count: number }[] = []
        for (const price in dic) {
            arr.push({
                side: dic[price].side,
                price: Number(price) / superGridConfig.价钱除以多少,//<---------
                count: dic[price].count,
            })
        }
        api.order(arr)
    }
}

export const superGridStep = (p2: SuperGridConfig) => (api2: 策略运行器) => {
    api = api2
    superGridConfig = p2
    step()
}