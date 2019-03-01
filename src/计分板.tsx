// import * as React from 'react'
// import * as ReactDOM from 'react-dom'
// import { config } from './config'
// import { OrderClient } from './OrderServer/OrderClient'
// import { Table } from './lib/UI/Table'
// import { windowExt } from './windowExt'

// const 计分板倍数 = config.account![windowExt.accountName].计分板倍数 || 1

// const orderClient = new OrderClient(config.account![windowExt.accountName].cookie)

// class APP extends React.Component {

//     componentWillMount() {
//         const f = () => {
//             requestAnimationFrame(f)
//             this.forceUpdate()
//         }
//         f()
//     }

//     render() {
//         const wallet = orderClient.jsonSync.rawData.wallet.filter(v => v.time > Date.now() - 12 * 60 * 60 * 1000)

//         const data = [] as {
//             id: number
//             time: number
//             earn: number
//         }[]

//         let counter = 0
//         for (let i = 1; i < wallet.length; i++) {
//             data.push({
//                 id: counter++,
//                 time: wallet[i].time,
//                 earn: (wallet[i].total - wallet[i - 1].total) * 计分板倍数
//             })
//         }

//         if (wallet.length >= 2) {
//             data.push({
//                 id: counter++,
//                 time: 0,
//                 earn: (wallet[wallet.length - 1].total - wallet[0].total) * 计分板倍数
//             })
//         }

//         return orderClient.isConnected === false ? <a href='#' onClick={() => location.reload()}><h1>连接中_点击刷新</h1></a> :
//             <Table
//                 dataSource={data}
//                 columns={[
//                     {
//                         title: '时间',
//                         width: '50%',
//                         render: v =>
//                             <p style={{ color: v.earn < 0 ? '#e56546' : '#49a965' }}>
//                                 {v.time === 0 ? '--' : new Date(v.time).toLocaleString()}
//                             </p>
//                     },
//                     {
//                         title: '收益',
//                         width: '50%',
//                         render: v =>
//                             <p style={{ color: v.earn < 0 ? '#e56546' : '#49a965' }}>
//                                 {v.earn / 100000}mXBT
//                         </p>
//                     }
//                 ]}
//                 rowKey={v => v.id}
//             />
//     }
// }


// ReactDOM.render(<APP />, document.querySelector('#root'))