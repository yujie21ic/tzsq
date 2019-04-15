import { BaseType } from './lib/BaseType'

// 方向  多 空 横
// 加仓开关
// 减仓开关
// 价格止损：到达价格，全部平仓+停止挂单
// 最大仓位

type 参数 = {
    单个格子大小: number
    单个格子数量: number
    格数: number
    方向: BaseType.Side
    最大仓位: number
}


export const BTC网格交易__参数: 参数 = {
    单个格子大小: 2.5,
    单个格子数量: 25,
    格数: 5,
    方向: 'Sell',
    最大仓位: 1000,
} 