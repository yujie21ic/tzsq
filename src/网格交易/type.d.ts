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