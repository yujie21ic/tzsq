import * as fs from 'fs'

const 北京时间 = () => {
    const date = new Date(Date.now() + 8 * 60 * 60 * 1000)
    const 月 = (date.getUTCMonth() + 1).toString().padStart(2, '0')
    const 日 = date.getUTCDate().toString().padStart(2, '0')
    const hh = date.getUTCHours().toString().padStart(2, '0')
    const mm = date.getUTCMinutes().toString().padStart(2, '0')
    const ss = date.getUTCSeconds().toString().padStart(2, '0')
    const msmsms = date.getUTCMilliseconds().toString().padStart(3, '0')
    return `${月}/${日} ${hh}:${mm}:${ss}/${msmsms}`
}


export const logToFile = (path: string) => (text: string) =>
    fs.writeFileSync(path, 北京时间() + text + '  \n', { flag: 'a' })