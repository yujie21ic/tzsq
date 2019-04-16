import { BitmexPositionAndOrder } from './lib/____API____/PositionAndOrder/BitmexPositionAndOrder'
import { config } from './config'
import { BTC网格交易 } from './task/BTC网格交易'

const account = new BitmexPositionAndOrder({
    accountName: 'fc01',
    cookie: config.account!.fc01.cookie,
    hopexCookie: '',
    fcoinCookie: '',
})
account.runTask('网格', new BTC网格交易())