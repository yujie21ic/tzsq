export const lastNumber = (arr: ArrayLike<number>) => {
    for (let i = arr.length - 1; i >= 0; i--) {
        if (isNaN(arr[i]) === false) {
            return arr[i]
        }
    }
    return NaN
}