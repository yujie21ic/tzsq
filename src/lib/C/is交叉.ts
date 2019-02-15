export const is交叉 = ({ a1, a2, b1, b2 }: { a1: number, a2: number, b1: number, b2: number }) => {
    if (isNaN(a1) || isNaN(a1) || isNaN(a1) || isNaN(a1)) return false

    const 没有交叉 = (a1 > b1 && a2 > b2) || (a1 < b1 && a2 < b2)

    return !没有交叉
}