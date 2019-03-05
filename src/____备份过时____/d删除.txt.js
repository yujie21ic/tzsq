
const 最高价10index = 指标.最高index(价格, 15, RealDataBase.单位时间)
const 最低价10index = 指标.最低index(价格, 15, RealDataBase.单位时间)
const 上涨还是下跌 = 指标.lazyMapCache(
        () => Math.min(最高价10index.length, 最低价10index.length),
        i => 最高价10index[i] > 最低价10index[i] ? '上涨' : '下跌'
)
