import { Container, Graphics } from 'pixi.js'
import { BitmapText } from './BitmapText'
import { range } from 'ramda'
import { theme } from './theme'

export class Coordinate extends Container {
    private g = new Graphics()
    private textContainer = new Container()
    private textArr: BitmapText[] = []
    private textBottomArr: BitmapText[] = []


    constructor() {
        super()
        this.addChild(this.g)
        this.addChild(this.textContainer)

        range(0, 200).forEach(() => {
            let text = new BitmapText({
                fontSize: 20,
                fill: 0xaaaaaa,
                anchor: { x: 0, y: 0.5 }
            })
            this.textContainer.addChild(text)
            this.textArr.push(text)
        })

        range(0, 200).forEach(() => {
            let text = new BitmapText({
                fontSize: 20,
                fill: 0xaaaaaa,
                anchor: { x: 0.5, y: 0.5 }
            })
            this.textContainer.addChild(text)
            this.textBottomArr.push(text)
        })
    }


    private III = 0
    private BBB = 0

    clear() {
        this.III = 0
        this.BBB = 0
        this.g.clear()
        this.textArr.forEach(v => v.visible = false)
        this.textBottomArr.forEach(v => v.visible = false)
    }

    drawH(width: number, height: number) {
        const { g } = this
        g.lineStyle(1, theme.边框颜色)
        g.moveTo(width, 0)
        g.lineTo(width, height)
    }

    drawTemp(x: number, height: number, msg: string) {
        const { g } = this
        g.lineStyle(1, 0x222222)
        g.moveTo(x, 0)
        g.lineTo(x, height)

        let text = this.textBottomArr[this.BBB]
        this.BBB += 1
        text.text = msg
        text.x = x
        text.y = height + theme.BOTTOM_HEIGHT / 2
        text.visible = true
    }



    render({ numberColor, numberX, width, startY, height, top, bottom, toY }: { numberColor?: number, numberX?: number, startY: number, width: number, height: number, top: number, bottom: number, toY: (value: number) => number }) {


        //Temp
        if (bottom === -Infinity) return
        const TABLE = [
            /*0.01, 0.02, 0.025,*/ 0.05,
            0.1, 0.2, 0.25, 0.5,
            1, 2, 2.5, 5,
            10, 20, 25, 50,
            100, 200, 250, 500,
            1000, 2000, 2500, 5000,
            10000, 20000, 25000, 50000,
            100000, 200000, 250000, 500000,
            1000000, 2000000, 2500000, 5000000,
            10000000, 20000000, 25000000, 50000000,
        ]

        let xx = ((top - bottom) / height) * 100 //最小间距
        let xxx2 = TABLE[0]
        for (let i = 0; i < TABLE.length; i++) {
            if (xx <= TABLE[i]) break
            xxx2 = TABLE[i]
        }
        const arr: { value: number, y: number }[] = []
        for (let i = Math.floor(bottom / xxx2 + 1) * xxx2; i < top; i += xxx2) {
            arr.push({ value: i, y: startY + toY(i) })
        }



        const { g } = this

        const x偏移 = (numberX === undefined ? 0 : numberX)

        //图表刻度 
        g.lineStyle(1, 0x222222)
        arr.forEach(({ value, y }) => {
            g.moveTo(0, y)
            g.lineTo(width, y)
        })

        //图表刻度数字
        g.lineStyle(1, 0xffffff)
        arr.forEach(({ value, y }) => {
            g.moveTo(x偏移 + width, y)
            g.lineTo(x偏移 + width + 8, y)
            let text = this.textArr[this.III]
            this.III += 1
            text.fill = numberColor === undefined ? 0xaaaaaa : numberColor
            text.text = value.toFixed(2)
            text.x = x偏移 + width + 15
            text.y = y
            text.visible = true
        })

        //底部线
        g.lineStyle(1, theme.边框颜色)
        g.moveTo(0, startY + height)
        g.lineTo(width + theme.RIGHT_WIDTH, startY + height)
    }
}