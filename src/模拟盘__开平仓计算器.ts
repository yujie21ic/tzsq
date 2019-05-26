export class 模拟盘__开平仓计算器 {
    private id = 1

    arr: { id: number, 时间: number, 仓位数量: number, 开仓均价: number, 收益: number }[] = []
    仓位数量 = 0
    开仓均价 = 0
    收益 = 0

    order(p: { time: number, price: number, size: number }) {

        const push = () => this.arr.push({
            id: this.id++,
            时间: p.time,
            仓位数量: this.仓位数量,
            开仓均价: this.开仓均价,
            收益: this.收益,
        })

        //开仓
        if (this.仓位数量 === 0) {
            this.开仓均价 = p.price
            this.仓位数量 = p.size
            this.收益 -= Math.abs(p.size) * 0.0005
            push()
        }
        //加仓
        else if ((this.仓位数量 > 0 && p.size > 0) || (this.仓位数量 < 0 && p.size < 0)) {
            this.开仓均价 = (this.开仓均价 * Math.abs(this.仓位数量) + p.price * Math.abs(p.size)) / (Math.abs(this.仓位数量) + Math.abs(p.size))
            this.仓位数量 += p.size
            this.收益 -= Math.abs(p.size) * 0.0005
            push()
        }
        //减仓 & 反手
        else {
            const x = Math.abs(this.仓位数量) - Math.abs(p.size)
            const 减仓数量_u = Math.min(Math.abs(this.仓位数量), Math.abs(p.size))


            //减仓
            this.收益 -= 减仓数量_u * 0.0005
            this.收益 += 0 //!!!!!!!!!!!!!!!!!

            this.仓位数量 += this.仓位数量 > 0 ? -减仓数量_u : 减仓数量_u
            if (this.仓位数量 === 0) this.开仓均价 = 0
            push()

            //反手开仓
            if (x < 0) {
                const 反手数量_u = -x
                this.开仓均价 = p.price
                this.仓位数量 = p.size > 0 ? 反手数量_u : -反手数量_u
                this.收益 -= 反手数量_u * 0.0005
                push()
            }
        }




    }

}