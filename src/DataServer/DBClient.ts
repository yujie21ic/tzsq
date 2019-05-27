import { JSONRPCClient } from '../F/JSONRPC'
import { DBServer__funcList } from './DBServer__funcList'

export const DBClient = new JSONRPCClient({
    funcList: DBServer__funcList,
    host: '150.109.48.108',
    port: 5555
})