export type ConfigType = {
    ss: boolean
    orderServerIP?: string
    tick历史加载多少秒?: number
    orderServer?: {
        [name: string]: {
            cookie: string
            hopexCookie?: string
        }
    }
    量化数量?: number
    account?: {
        [name: string]: {
            cookie: string
            hopexCookie?: string
            hopex数量?: number
            交易: {
                XBTUSD: {
                    数量: number
                }
                ETHUSD: {
                    数量: number
                }
            }
            计分板倍数?: number
        }
    }
} 