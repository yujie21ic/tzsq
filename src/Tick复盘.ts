import { DataClient } from './RealDataServer/DataClient'
import { TickBase } from './TickBase'
import { registerCommand } from './lib/UI/registerCommand'
import { windowExt } from './windowExt'

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
}

new Tick复盘()