import { JSONRequest } from '../F/JSONRequest'
import { queryStringStringify } from '../F/queryStringStringify'
import { timeID } from '../F/timeID'
import { sleep } from '../F/sleep'

const toS = (n: number) => Math.floor(n / 1000)

type KL = {
    id: number
    open: number
    high: number
    low: number
    close: number
}

export class HopexRealKLine {

    kline: KL[] = []

    onFirstLoad = () => { }

    private load = async () => {

        const startTime = this.kline.length > 0 ?
            toS(timeID._60s.toTimestamp(this.kline[this.kline.length - 1].id)) :
            toS(Date.now() - (1000 * 60 * 60 * 24))

        const endTime = toS(Date.now() + 1000 * 60)

        const { data, error, msg } = await JSONRequest<{ data?: string[][] }>({
            url: 'https://web.hopex.com/api/v1/gateway/Home/KLines?' + queryStringStringify({
                startTime,
                endTime,
                interval: 60,
                market: 'BTCUSD',
                marketCode: 'BTCUSD',
                contractCode: 'BTCUSD',
            }),
            method: 'GET',
            ss: false,
        })

        if (data === undefined || data.data === undefined) {
            console.log('load error', error, msg)
            return
        }

        data.data.forEach(v => {
            const id = timeID._60s.toID(Number(v[0]) * 1000)
            if (this.kline.length === 0 || id > this.kline[this.kline.length - 1].id) {
                this.kline.push({
                    id,
                    open: Number(v[1]),
                    high: Number(v[3]),
                    low: Number(v[4]),
                    close: Number(v[2]),
                })
            } else if (id === this.kline[this.kline.length - 1].id) {
                this.kline[this.kline.length - 1] = {
                    id,
                    open: Number(v[1]),
                    high: Number(v[3]),
                    low: Number(v[4]),
                    close: Number(v[2]),
                }
            }
        })
    }

    private async run() {
        await this.load()
        this.onFirstLoad()

        while (true) {
            await this.load()
            await sleep(10)
        }
    }

    constructor() {
        this.run()
    }
}