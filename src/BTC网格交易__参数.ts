type AAAA = {
    get单个格子大小: (n: number) => number          //n是距离   没算累计
    get单个格子数量: (n: number) => number          //n是仓位数量 算了累计

    格数: number
    重挂时间: number

    buy条件: (p: {
        仓位数量: number
        价格: number
        开仓均价: number
    }) => boolean

    sell条件: (p: {
        仓位数量: number
        价格: number
        开仓均价: number
    }) => boolean
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
        get单个格子大小: (n: number) => 1,
        get单个格子数量: (n: number) => 25,

        格数: 10,
        重挂时间: 1000 * 60,

        buy条件: (p: {
            仓位数量: number
            价格: number
            开仓均价: number
        }) => true,

        sell条件: (p: {
            仓位数量: number
            价格: number
            开仓均价: number
        }) => true,
    },
    减仓: {
        get单个格子大小: (n: number) => 1,
        get单个格子数量: (n: number) => 25,

        格数: 10,
        重挂时间: 1000 * 60,

        buy条件: (p: {
            仓位数量: number
            价格: number
            开仓均价: number
        }) => true,

        sell条件: (p: {
            仓位数量: number
            价格: number
            开仓均价: number
        }) => true,
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