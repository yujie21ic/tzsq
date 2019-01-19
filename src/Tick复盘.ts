import { DataClient } from './RealDataServer/DataClient'
import { TickBase } from './TickBase'
import { registerCommand } from './lib/UI/registerCommand'

class Tick复盘 extends TickBase {

    real = new DataClient.RealData__History()

    constructor() {
        super()

        registerCommand('load', '时间', v => {
            this.real = new DataClient.RealData__History()
            this.real.load(new Date(String(v)).getTime())
            this.real.重新初始化()
        })
    }
}

new Tick复盘()