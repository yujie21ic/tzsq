export type ConfigType = {
    ss: boolean
    orderServerIP?: string
    tick历史加载多少秒?: number
    orderServer?: {
        [name: string]: {
            cookie: string
            hopexCookie: string
            fcoinCookie: string
        }
    } 
    account?: {
        [name: string]: {
            cookie: string
            hopexCookie: string
            fcoinCookie: string
            计分板倍数?: number
        }
    }
} 