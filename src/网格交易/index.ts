import { 策略运行器 } from '../WebService/策略运行器'
import { superGridStep } from './superGridStep'
import * as electron from 'electron'
import * as fs from 'fs'
import * as f from '../lib/IOF'

const filepath = './build/_________________________.js'
const noneStep = () => { }


const getReal = () => {
    let real = {} as RealType

    eval(`(real)=>{
            ${fs.readFileSync(filepath)}
        }`)(real)

    return real
}

const firstReal = getReal()

let api = new 策略运行器(firstReal.config.symbol, firstReal.config.cookie)
let runStep = superGridStep(firstReal.ploy)

fs.watchFile(filepath, () => {
    runStep = superGridStep(getReal().ploy)
    console.log('最后修改时间', new Date().toLocaleString())
})

api.onStep = noneStep
api.run()


f.registerCommand('run', '1:开始运行  0:停止运行', p => {
    if (p === 1) {
        api.onStep = s => runStep(s)//<----------------------------fix
        electron.remote.getCurrentWindow().setTitle('tzsq 运行中')
        return true
    } else if (p === 0) {
        api.onStep = noneStep
        electron.remote.getCurrentWindow().setTitle('tzsq')
        return true
    } else {
        return false
    }
})  