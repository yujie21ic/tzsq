import { JSONSync } from '../lib/C/JSONSync'

export class AccountBase {

    jsonSync = new JSONSync(
        {
            //资金曲线
            wallet: [] as {
                time: number
                total: number
            }[],
            //
            symbol: {
                XBTUSD: {
                    //过时
                    状态: '--' as '--' | '开仓中' | '平仓中',
                    msg: '',
                    //新
                    任务: {
                        止损: false,
                        止盈: false,
                    },
                    委托: {
                        活动委托: [] as {}[],
                        止损委托: [] as {}[],
                        止盈委托: [] as {}[],
                    }
                },
                ETHUSD: {
                    //过时
                    状态: '--' as '--' | '开仓中' | '平仓中',
                    msg: '',
                    //新
                    任务: {
                        止损: false,
                        止盈: false,
                    },
                    委托: {
                        活动委托: [] as {}[],
                        止损委托: [] as {}[],
                        止盈委托: [] as {}[],
                    }
                },
            }
        }
    )
} 