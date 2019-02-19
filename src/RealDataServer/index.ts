import { RealData } from './RealData'

const realTickService = new RealData()
realTickService.onTitle = console.log



setInterval(() => {
    const d = realTickService.dataExt.XBTUSD.期货.信号_下跌
    console.log(d.length > 0 ? d[d.length - 1].map(v => v.value ? 'O' : '_').join('') : '')
}, 100)