import { DataClient } from './RealDataServer/DataClient'
import { TickBase } from './TickBase'

export class Tick行情 extends TickBase {

    title = '实时'
    real = new DataClient.RealData__Client()

    constructor(element: HTMLElement) {
        super(element)
    }
}

// new Tick行情(document.querySelector('#root') as HTMLElement)