// wss://api.bitfinex.com/ws

// ws.onopen = () => {
//     ws.send({
//         event: 'subscribe',
//         channel: 'trades',
//         pair: 'BTCUSD'
//     })
// }

// ws.onmessage = data => {
//     if (Array.isArray(data) && data[1] == 'te') {
//         onData({
//             tick: Number(data[3]),
//             price: Number(data[4]),
//             obv: Number(data[5])
//         })
//     }
// }

// ws.onclose = connect 