import * as fs from 'fs'

let audio = new Audio(
    URL.createObjectURL(
        new Blob([fs.readFileSync('./123.mp3')])
    )
)


const _1分钟内只执行一次 = (fn: () => void) => {
    let 可以执行 = true
    return () => {
        if (可以执行) {
            fn()
            可以执行 = false
            setTimeout(() => {
                可以执行 = true
            }, 60 * 1000)
        }
    }
}


export const playSound = _1分钟内只执行一次(() => audio.play())