import { JSONRequest } from '../lib/F/JSONRequest'
import { queryStringStringify } from '../lib/F/queryStringStringify'
import { timeID } from '../lib/F/timeID'
import { sleep } from '../lib/F/sleep'
import { registerCommand } from '../lib/UI/registerCommand'
import { DBClient } from '../lib/DataServer/DBClient'

const toS = (n: number) => Math.floor(n / 1000)

type KL = {
    id: number
    open: number
    high: number
    low: number
    close: number
}



export class HopexRealKLineBase {
    readonly kline: KL[] = []
    onFirstLoad = () => { }
}


export class HopexRealKLine extends HopexRealKLineBase {

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
                market: 'BTCUSDT',
                marketCode: 'BTCUSDT',
                contractCode: 'BTCUSDT',
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
        super()
        this.run()
    }
}

export class HopexRealKLineHistory extends HopexRealKLineBase {


    private temp = true
    private speed = 1

    constructor() {
        super()

        registerCommand('speed', '速度', async p => {
            this.speed = Number(p)
        })

        registerCommand('load', '加载', async p => {
            const start = new Date(String(p)).getTime()
            const ret = await DBClient.func.getKLine({
                type: '500ms',
                symbol: 'BTCUSDT',
                startTime: start,
                endTime: start + 1000 * 60 * 60 * 24, //1day
            })

            if (ret.data) {
                console.log(ret.data.length)
                for (let i = 0; i < ret.data.length; i++) {
                    const v = ret.data[i]
                    const id = timeID._60s.toID(timeID._500ms.toTimestamp(v.id))
                    if (this.kline.length === 0 || id > this.kline[this.kline.length - 1].id) {
                        this.kline.push({
                            id,
                            open: v.open,
                            high: v.high,
                            low: v.low,
                            close: v.close,
                        })
                    } else if (id === this.kline[this.kline.length - 1].id) {
                        this.kline[this.kline.length - 1] = {
                            id,
                            open: this.kline[this.kline.length - 1].open,
                            high: Math.max(this.kline[this.kline.length - 1].high, v.high),
                            low: Math.min(this.kline[this.kline.length - 1].high, v.low),
                            close: v.close,
                        }
                    }
                    if (this.temp) {
                        this.temp = false
                        this.onFirstLoad()
                    }
                    if (this.kline.length > 60) await sleep(500 / this.speed)
                }
            }
        })
    }

}