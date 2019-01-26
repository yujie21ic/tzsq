import { JSONRPCClient } from '../lib/C/JSONRPC'
import { funcList } from './funcList'

export const PKClient = new JSONRPCClient({
    funcList,
    host: '34.255.160.206',
    port: 5555
})