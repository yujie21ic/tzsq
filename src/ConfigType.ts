export type ConfigType = {
    ss: boolean
    orderServerIP?: string
    tick历史加载多少秒?: number
    下单数量?: number
    orderServer?: {
        [name: string]: {
            cookie: string 
        }
    }
    account?: {
        [name: string]: {
            cookie: string 
        }
    }
} 