import { config } from './config'
import { OrderClient } from './OrderServer/OrderClient'
import { windowExt } from './windowExt'
import { chartInit, layer } from './lib/Chart'
import { LineLayer } from './lib/Chart/Layer/LineLayer'
import { theme } from './lib/Chart/theme'

theme.右边空白 = 0

const orderClient = new OrderClient(config.account![windowExt.accountName].cookie)

chartInit(60, document.querySelector('#root') as HTMLElement, () => {
    const { wallet } = orderClient.jsonSync.rawData
    const xStrArr = wallet.map(v => new Date(v.time).toLocaleString())
    const arr = wallet.map(v => v.total)

    return {
        xStrArr,
        显示y: () => undefined,
        left: 0,
        right: xStrArr.length - 1,
        items: {
            heightList: [1],
            items: [
                {
                    layerList: [
                        layer(LineLayer, { data: arr, color: 0xffffff }),
                    ]
                },
            ]
        }
    }
})