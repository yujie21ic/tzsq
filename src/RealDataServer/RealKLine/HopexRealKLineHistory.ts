import { RealKLineBase } from './RealKLineBase'
import { registerCommand } from '../../UI/registerCommand'
import { DBClient } from '../../DataServer/DBClient'
import { timeID } from '../../F/timeID'
import { sleep } from '../../F/sleep'

export class HopexRealKLineHistory extends RealKLineBase {


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
                    if (this.kline.length > 600) await sleep(500 / this.speed)
                }
            }
        })
    }

}