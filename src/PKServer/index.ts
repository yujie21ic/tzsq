import { syncBitmex500msOrderBook } from './syncBitmex500msOrderBook'
import { syncHopex500msOrderBook } from './syncHopex500msOrderBook'
import { PKServer } from './PKServer'

syncBitmex500msOrderBook()
syncHopex500msOrderBook()

PKServer.run()