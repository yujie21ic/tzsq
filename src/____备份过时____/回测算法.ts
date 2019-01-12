/*

marketOrder(side: Side, count: number) {
    this.entryPrice = (this.entryPrice * Math.abs(this.myPosition) + this.lastPrice * count) / (Math.abs(this.myPosition) + count)

    if (side == 'Buy') {
        this.myPosition += count
    } else {
        this.myPosition -= count
    }

    if (this.maxPosition < Math.abs(this.myPosition)) {
        this.maxPosition = Math.abs(this.myPosition)
    }
}


marketCloseAll() {
    const 盈利 = this.myPosition * (1 / this.entryPrice - 1 / this.lastPrice)
    this.myPosition = 0
    this.entryPrice = 0
    this.accumulatedProfit += 盈利
    this.closePositionTimes += 1
}

*/