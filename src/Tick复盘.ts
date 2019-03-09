import { DataClient } from './RealDataServer/DataClient'
import { TickBase } from './TickBase'
import { registerCommand } from './lib/UI/registerCommand'
import { windowExt } from './windowExt'
import { RealDataBase } from './RealDataServer/RealDataBase'
import { theme } from './lib/Chart/theme'

theme.右边空白 = 0

class Tick复盘 extends TickBase {

    title = new Date(windowExt.startTime).toLocaleString()
    real = new DataClient.RealData__History()

    constructor(element: HTMLElement) {
        super(element)

        this.nowTickSymbol = windowExt.symbol

        if (windowExt.startTime !== 0) {
            this.real = new DataClient.RealData__History()
            this.real.load(windowExt.startTime)
        }

        registerCommand('load', '时间', v => {
            this.real = new DataClient.RealData__History()
            this.real.load(new Date(String(v)).getTime())
        })

        window.onkeydown = e => {
            if (e.keyCode === 32) {
                this.加速 = true
            }
        }

        window.onkeyup = e => {
            if (e.keyCode === 32) {
                this.加速 = false
            }
        }
    }

    加速 = false

    c = 0
    getLeftRight() {
        const d = this.real.dataExt[this.nowTickSymbol]

            ; (window as any)['d'] = d

        const right2 = Math.max(d.现货.价格.length, d.期货.价格.length, d.期货.买.盘口.length, d.期货.卖.盘口.length) - 1
        if (right2 === 0) {
            this.c = 0
        } else {
            this.c += (this.加速 ? 500 : 1) / 60 * (1000 / RealDataBase.单位时间)
        }
        //2分钟前的直接显示
        const right = Math.min(120 * (1000 / RealDataBase.单位时间) + Math.floor(this.c), right2)
        const left = Math.max(0, right - this.showCount)
        return { left, right }
    }

}

new Tick复盘(document.querySelector('#root') as HTMLElement)


    ; (window as any)['log'] = (arr: ArrayLike<any>) => {
        const x: any = []
        for (let i = 0; i < arr.length; i++) {
            x.push(arr[i])
        }
        console.log(JSON.stringify(x))
    }