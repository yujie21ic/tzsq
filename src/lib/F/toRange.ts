export const toRange = ({ min, max, value }: { min: number, max: number, value: number }) => {
    if (value < min) {
        return min
    }
    if (value > max) {
        return max
    }
    else {
        return value
    }
}
