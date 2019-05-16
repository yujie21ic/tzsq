import { JSONRequest } from "./lib/F/JSONRequest";

// import { 回测PositionAndOrder } from './lib/____API____/PositionAndOrder/回测PositionAndOrder'
// import { XBTUSD摸顶抄底追涨追跌 } from './XBTUSD摸顶抄底追涨追跌'

// //  const start = new Date('2019-03-16T08:40:00')
// //  const end =   new Date('2019-03-16T08:59:00')
// const start = new Date('2019-04-01T08:10:00')
// const end =   new Date('2019-04-01T08:30:00')

// const p = new 回测PositionAndOrder(start.getTime(), end.getTime())
// // p.jsonSync.rawData.symbol.Hopex_BTC.任务开关.自动开仓抄底 = true
// // p.jsonSync.rawData.symbol.Hopex_BTC.任务开关.自动开仓摸顶 = true
// // p.jsonSync.rawData.symbol.Hopex_BTC.任务开关.自动推止损 = true
// // p.jsonSync.rawData.symbol.Hopex_BTC.任务开关.自动止盈波段 = true
//  p.jsonSync.rawData.symbol.XBTUSD.任务开关.自动开仓抄底 = true
//  //p.jsonSync.rawData.symbol.XBTUSD.任务开关.自动开仓摸顶 = true
// // p.jsonSync.rawData.symbol.XBTUSD.任务开关.自动开仓追涨 = false
// // p.jsonSync.rawData.symbol.XBTUSD.任务开关.自动开仓追跌 = false


// // p.jsonSync.rawData.symbol.XBTUSD.任务开关.自动开仓抄底 = false
// // p.jsonSync.rawData.symbol.XBTUSD.任务开关.自动开仓摸顶 = false
// // p.jsonSync.rawData.symbol.XBTUSD.任务开关.自动开仓追涨 = true
// // p.jsonSync.rawData.symbol.XBTUSD.任务开关.自动开仓追跌 = true
//  p.jsonSync.rawData.symbol.XBTUSD.任务开关.自动推止损 = true
//  p.jsonSync.rawData.symbol.XBTUSD.任务开关.自动止盈波段 = true


// p.runTask(new XBTUSD摸顶抄底追涨追跌())

console.log('xxxxxxxxxxxx')
JSONRequest({
    url: 'https://www.baidu.com/s?ie=utf-8&f=3&rsv_bp=1&rsv_idx=1&tn=baidu&wd=ip138%E6%9F%A5%E8%AF%A2&rsv_pq=caea138300026a8b&rsv_t=ec7bP6FsujrRtSzhs%2BfSz6sUD%2BrXlWvUwastubR4BGnIq1ahbYMrmtFqgcw&rqlang=cn&rsv_enter=1&rsv_sug3=5&rsv_sug1=3&rsv_sug7=101&rsv_sug2=0&prefixsug=ip1%2526lt%253B&rsp=0&inputT=1113&rsv_sug4=1686&rsv_sug=1',
    method: 'GET',
    ss: {
        socksHost: '123.207.23.18',
        socksPort: 23128,
        socksUsername: 'wgwhngqrp0',
        socksPassword: 'bvnwtpmqwc',
    },
    headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36',
    }
}).then(res => {
    console.log(res)
})