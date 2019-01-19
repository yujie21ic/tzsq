import { typeObjectParse } from './lib/F/typeObjectParse'

export const windowExt = typeObjectParse({
    accountName: ''
})((window as any)['windowExt'])