import { DataClient } from './RealDataServer/DataClient'
import { TickBase } from './TickBase'
import { registerCommand } from './lib/UI/registerCommand'

class Tick复盘 extends TickBase {

    real = new DataClient.RealData__History()

    constructor() {
        super()

        const 历史模式 = (v: string) => {
            this.real = new DataClient.RealData__History()
            this.real.load(new Date(v).getTime())
            this.real.重新初始化()
        }

        registerCommand('load', '时间', v => {
            const str = String(v)
            历史模式(str)
        })
    }
}

new Tick复盘()