import { JSONRPCClient } from '../lib/C/JSONRPC'
import { funcList } from './funcList'

export const DBClient = new JSONRPCClient({
    funcList,
    host: '150.109.48.108',
    port: 5555
})