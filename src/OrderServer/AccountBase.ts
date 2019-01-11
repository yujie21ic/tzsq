import { JSONSync } from '../lib/C/JSONSync'

export class AccountBase {

    jsonSync = new JSONSync(
        {
            wallet: [] as {
                time: number
                total: number
            }[],
            symbol: {
                XBTUSD: {
                    状态: '--' as '--' | '开仓中' | '平仓中',
                    msg: ''
                },
                ETHUSD: {
                    状态: '--' as '--' | '开仓中' | '平仓中',
                    msg: ''
                },
            }
        }
    )
} 