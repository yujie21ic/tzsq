export type ConfigType = {
    ss: boolean
    tick历史加载多少秒?: number
    orderServer?: {
        [name: string]: string //cookie
    }
    account?: {
        [name: string]: {
            cookie: string
            交易: {
                XBTUSD: {
                    数量: 1
                }
            }
            计分板倍数?: number
        }
    }
}

export const getAccountName = () => (window as any)['accountName'] 