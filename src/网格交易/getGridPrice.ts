//获取网格 买卖 价格 
export const getGridPrice = (p: { side: Side, price: number, gridPoint: number }) => {
    if (p.side == 'Buy') {
        const ret = Math.floor(p.price / p.gridPoint) * p.gridPoint
        if (ret == p.price) {
            return ret - p.gridPoint
        } else {
            return ret
        }
    } else {
        const ret = Math.floor(p.price / p.gridPoint + 1) * p.gridPoint
        if (ret == p.price) {
            return ret + p.gridPoint
        } else {
            return ret
        }
    }
}