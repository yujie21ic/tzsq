type AAAA = {
    单个格子大小: number
    单个格子数量: number
    格数: number
    重挂时间: number
}

type 参数 = {
    加仓: AAAA
    减仓: AAAA
    多仓: {
        min: number
        max: number
    }
    空仓: {
        min: number
        max: number
    }
}


export const BTC网格交易__参数: 参数 = {
    加仓: {
        单个格子大小: 5,
        单个格子数量: 25,
        格数: 5,
        重挂时间: 1000 * 60,
    },
    减仓: {
        单个格子大小: 5,
        单个格子数量: 25,
        格数: 5,
        重挂时间: 1000 * 60,
    },
    多仓: {
        min: 0,
        max: 1000,
    },
    空仓: {
        min: 0,
        max: 1000,
    },
} 