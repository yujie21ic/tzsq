import * as TQSDK from 'tqsdk'


console.log('xxxx')

const tqsdk = new TQSDK({
    sim_server_url: 'wss://openmd.shinnytech.com/t/md/front/mobile', // 行情接口
    tr_server_url: 'wss://opentd.shinnytech.com/trade/user0', // 交易接口
    default_bid: '快期模拟', // 默认期货公司
    reconnect_interval: 2000, // 重连时间间隔 ms
    reconnect_max_times: 5, // 最大尝试重连次数
})

tqsdk.on('ready', x => {
    console.log('收到合约基础数据', x)
})

tqsdk.on('rtn_brokers', x => {
    console.log('收到期货公司列表', x)
})

tqsdk.on('notify', x => {
    console.log('收到通知对象', x)
})

tqsdk.on('rtn_data', x => {
    console.log('数据更新（每一次数据更新触发）', x)
})

tqsdk.on('error', x => {
    console.log('发生错误(目前只有一种：合约服务下载失败)', x)
})


tqsdk.subscribe_quote('rtn_data') 