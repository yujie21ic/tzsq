import { BaseType } from './lib/BaseType'

export type ConfigType = {
    ss: boolean
    tick历史加载多少秒?: number
    orderServer?: {
        [name: string]: string //cookie
    }
    account?: {
        [name: string]: {
            cookie: string
            一键买卖: {
                symbol: BaseType.BitmexSymbol
                size: number
            }[]
            计分板倍数?: number
        }
    }
}

export const getAccountName = () => (window as any)['accountName'] 