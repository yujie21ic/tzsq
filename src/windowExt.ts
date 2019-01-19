import { typeObjectParse } from './lib/F/typeObjectParse'
import { BaseType } from './lib/BaseType'

export const windowExt = typeObjectParse({
    accountName: '',
    symbol: 'XBTUSD' as BaseType.BitmexSymbol,
    startTime: 0,
})((window as any)['windowExt'])