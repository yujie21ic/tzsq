type KL = {
    id: number
    open: number
    high: number
    low: number
    close: number
}


export class RealKLineBase {
    readonly kline: KL[] = []
    onFirstLoad = () => { }
}