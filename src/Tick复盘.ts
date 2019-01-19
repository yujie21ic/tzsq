import { DataClient } from './RealDataServer/DataClient'
import { TickBase } from './TickBase'
import { registerCommand } from './lib/UI/registerCommand'
import { windowExt } from './windowExt'
import { RealDataBase } from './RealDataServer/RealDataBase'

class Tick复盘 extends TickBase {

    real = new DataClient.RealData__History()

    constructor() {
        super()

        this.nowTickSymbol = windowExt.symbol

        if (windowExt.startTime !== 0) {
            this.real = new DataClient.RealData__History()
            this.real.load(windowExt.startTime)
        }

        registerCommand('load', '时间', v => {
            this.real = new DataClient.RealData__History()
            this.real.load(new Date(String(v)).getTime())
        })
    }


    c = 0
    getLeftRight() {
        const d = this.real.dataExt[this.nowTickSymbol]
        const right2 = Math.max(d.现货.价格.length, d.期货.价格.length, d.期货.盘口买.length, d.期货.盘口卖.length) - 1
        if (right2 === 0) {
            this.c = 0
        } else {
            this.c += 1 / 60 * (1000 / RealDataBase.单位时间)
        }
        const right = Math.min(600 * (1000 / RealDataBase.单位时间) + Math.floor(this.c), right2)
        const left = Math.max(0, right - this.showCount)
        return { left, right }
    }

}

new Tick复盘()