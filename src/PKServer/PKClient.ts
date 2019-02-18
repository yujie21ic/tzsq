import { JSONRPCClient } from '../lib/C/JSONRPC'
import { funcList } from './funcList'

export const PKClient = new JSONRPCClient({
    funcList,
    host: '63.33.56.32',
    port: 5555
})