export const is交叉 = ({ a1, a2, b1, b2 }: { a1: number, a2: number, b1: number, b2: number }) =>
    !((a1 > b1 && a2 > b2) || (a1 < b1 && a2 < b2))