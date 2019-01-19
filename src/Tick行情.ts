import { DataClient } from './RealDataServer/DataClient'
import { TickBase } from './TickBase'

class Tick行情 extends TickBase {

    real = new DataClient.RealData__Client()

    constructor() {
        super()
    }
}

new Tick行情()