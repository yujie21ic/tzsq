import { BaseType } from '../lib/BaseType'
import { JSONSync } from '../lib/C/JSONSync'

export const funcList = {
    //TODO
    任务开关: {
        req: {
            cookie: '',
            symbol: '' as BaseType.BitmexSymbol,
            key: '' as '止盈' | '止损',
            isOpen: false,
        },
        res: ''
    },
    

    //TODO  止损 和 止盈(减仓)  不取消
    取消全部活动委托: {
        req: {
            cookie: '',
            symbol: '' as BaseType.BitmexSymbol,
        },
        res: ''
    },

    //
    市价平仓全部: {
        req: {
            cookie: '',
            symbol: '' as BaseType.BitmexSymbol,
        },
        res: ''
    },

    //挂单 吃单
    下单: {
        req: {
            cookie: '',
            symbol: '' as BaseType.BitmexSymbol,
            type: '' as 'taker' | 'maker',
            side: '' as BaseType.Side,
            size: 0,
        },
        res: ''
    },

    //走平挂单
    走平挂单: {
        req: {
            cookie: '',
            side: '' as BaseType.Side,
            size: 0,
            现货: {
                symbol: '' as BaseType.BinanceSymbol,
                超时秒: 0,
                偏移: 0,
            },
            期货: {
                symbol: '' as BaseType.BitmexSymbol,
                超时秒: 0,
                偏移: 0,
            },
        },
        res: ''
    },


    //走平挂单_____过时_____过时_____过时_____过时_____过时_____过时_____过时_____过时_____过时_____过时_____过时_____过时_____过时_____过时_____过时
    走平挂单_____过时: {
        req: {
            cookie: '',
            symbol: '' as BaseType.BitmexSymbol,
            type: '' as 'taker' | 'maker',
            side: '' as BaseType.Side,
            size: 0,
            止损点: 0,
            延迟下单: [{
                现货: {
                    symbol: '' as BaseType.BinanceSymbol,
                    超时秒: 0,
                    偏移: 0,
                },
                期货: {
                    超时秒: 0,
                    偏移: 0,
                }
            }]
        },
        res: ''
    },
}



export const createJSONSync = () =>
    new JSONSync(
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