import { BaseType } from './lib/BaseType'
import { funcList } from './OrderServer/funcList'

export type ConfigType = {
    ss: boolean
    tick历史加载多少秒?: number
    orderServiceCookie?: string[]
    account?: {
        [name: string]: {
            cookie: string
            一键买卖: YJMM[]
            计分板倍数?: number
        }
    }
}

export const getAccountName = () => (window as any)['accountName']

export type YJMM = {
    symbol: BaseType.BitmexSymbol
    size: number
    止损点: number
    延迟下单: typeof funcList.走平挂单.req.延迟下单
}