import { JSONRequest } from '../F/JSONRequest'
import { queryStringStringify } from '../F/queryStringStringify'
import { 指标 } from '../../指标/指标'
import { timeID } from '../F/timeID'

const toS = (n: number) => Math.floor(n / 1000)

type KL = {
    id: number
    open: number
    high: number
    low: number
    close: number
}


export class HopexRealKLine {

    timeArr: ArrayLike<string> = []
    kline: ArrayLike<KL> = []

    onFirstLoad = () => { }

    private load = async () => {
        const { data, error, msg } = await JSONRequest<{ data: string[][] }>({
            url: 'https://web.hopex.com/api/v1/gateway/Home/KLines?' + queryStringStringify({
                startTime: toS(Date.now() - (1000 * 60 * 60 * 24)),
                endTime: toS(Date.now() + 1000 * 60),
                interval: 60,
                market: 'BTCUSD',
                marketCode: 'BTCUSD',
                contractCode: 'BTCUSD',
            }),
            method: 'GET',
            ss: false,
        })

        if (data === undefined) {
            console.log('load error', error, msg)
            return
        }

        const arr = data.data

        this.timeArr = 指标.map(() => arr.length, i => new Date(Number(arr[i][0]) * 1000).toLocaleString())

        this.kline = arr.map(v => ({
            id: timeID._60s.toID(Number(v[0]) * 1000),
            open: Number(v[1]),
            high: Number(v[3]),
            low: Number(v[4]),
            close: Number(v[2]),
            buySize: 0,
            sellSize: 0,
            buyCount: 0,
            sellCount: 0,
        }))

        this.onFirstLoad()
    }

    constructor() {
        this.load()
    }
}