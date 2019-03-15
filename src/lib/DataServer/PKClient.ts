import { JSONRPCClient } from '../C/JSONRPC'
import { PKServer__funcList } from './PKServer__funcList'

export const PKClient = new JSONRPCClient({
    funcList: PKServer__funcList,
    //盘口服务器
    host: '124.156.117.110',
    port: 5555
})