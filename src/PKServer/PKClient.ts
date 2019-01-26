import { JSONRPCClient } from '../lib/C/JSONRPC'
import { funcList } from './funcList'

export const PKClient = new JSONRPCClient({
    funcList,
    host: '35.220.182.184',
    port: 5555
})