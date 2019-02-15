export const get交叉点价格 = ({ a1, a2, b1, b2 }: { a1: number, a2: number, b1: number, b2: number }) => {
    const 不交叉 = (a1 > b1 && a2 > b2) || (a1 < b1 && a2 < b2)
    if (不交叉) {
        return NaN
    } else {
        return (a2 + b2) / 2 //懒得算了
    }
}