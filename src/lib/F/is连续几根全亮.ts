export const is连续几根全亮 = (几根: number, arr: ArrayLike<{ value: boolean }[]>) => {
    let 连续几根 = 0
    for (let i = arr.length - 1; i >= 0; i--) {
        if (arr[i].every(v => v.value)) {
            连续几根++
            if (连续几根 === 几根) return true
        } else {
            return false
        }
    }
    return false
}