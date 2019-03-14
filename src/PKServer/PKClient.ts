import { JSONRPCClient } from '../lib/C/JSONRPC'
import { PKServer__funcList } from './PKServer__funcList'

export const PKClient = new JSONRPCClient({
    funcList: PKServer__funcList,
    //盘口服务器
    host: '34.247.219.144',
    port: 5555
})