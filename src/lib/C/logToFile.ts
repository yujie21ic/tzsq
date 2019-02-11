import * as fs from 'fs'

export const logToFile = (path: string, text: string) =>
    fs.writeFileSync(path, new Date().toLocaleString() + text + '  \n', { flag: 'a' })
