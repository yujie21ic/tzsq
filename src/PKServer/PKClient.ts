import { JSONRPCClient } from '../lib/C/JSONRPC'
import { funcList } from './funcList'

export const PKClient = new JSONRPCClient({
    funcList,
    //盘口服务器
    host: '34.254.250.43',
    port: 5555
})