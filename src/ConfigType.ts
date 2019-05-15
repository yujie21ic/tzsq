export type ConfigType = {
    ss: boolean
    orderServerIP?: string
    tick历史加载多少秒?: number
    下单数量?: number
    orderServer?: {
        [name: string]: {
            cookie: string
            hopexCookie: string
        }
    }
    account?: {
        [name: string]: {
            cookie: string
            hopexCookie: string
            计分板倍数?: number
        }
    }
    hopex?: {
        [name: string]: {
            cookie: string
            下单数量: number
            偏移: number
        }
    }
} 