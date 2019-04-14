import { BitmexPositionAndOrder } from './lib/____API____/PositionAndOrder/BitmexPositionAndOrder'
import { config } from './config'
import { BTC网格交易 } from './BTC网格交易'

const account = new BitmexPositionAndOrder({
    accountName: 'fc01',
    cookie: config.account!.fc01.cookie,
    hopexCookie: '',
    fcoinCookie: '',
})
account.runTask(new BTC网格交易())