import { Graphics, Container } from 'pixi.js'
import { BitmapText } from './BitmapText'
import { theme } from './theme'

export class Crosshairs extends Container {

    private g = new Graphics()

    private 价格高亮bg = new Graphics()
    private 价格高亮Text = new BitmapText({
        fontSize: 20,
        fill: 0xffff00,
        anchor: { x: 0, y: 0.5 }
    })

    private 时间高亮bg = new Graphics()
    private 时间高亮Text = new BitmapText({
        fontSize: 20,
        fill: 0xffff00,
        anchor: { x: 0.5, y: 0.5 }
    })

    constructor() {
        super()
        this.addChild(this.g)

        this.addChild(this.价格高亮bg)
        this.addChild(this.价格高亮Text)

        this.addChild(this.时间高亮bg)
        this.addChild(this.时间高亮Text)
    }

    private 价格高亮render(p?: { str: string, x: number, y: number }) {

        if (p === undefined) {
            this.价格高亮bg.visible = false
            this.价格高亮Text.visible = false
            return
        }

        this.价格高亮bg.visible = true
        this.价格高亮Text.visible = true

        //背景
        this.价格高亮bg.clear()
        this.价格高亮bg.lineStyle(1, 0xffffff)
        this.价格高亮bg.beginFill(0x111111)
        this.价格高亮bg.drawRect(p.x, p.y - 16, theme.RIGHT_WIDTH, 32)
        this.价格高亮bg.endFill()

        //文字 
        this.价格高亮Text.x = p.x + 10
        this.价格高亮Text.y = p.y
        this.价格高亮Text.text = p.str
    }

    private 时间高亮render(p?: { str: string, x: number, y: number }) {

        if (p === undefined) {
            this.时间高亮bg.visible = false
            this.时间高亮Text.visible = false
            return
        }

        this.时间高亮bg.visible = true
        this.时间高亮Text.visible = true

        //背景
        const ww = this.时间高亮Text.width + 20
        this.时间高亮bg.clear()
        this.时间高亮bg.lineStyle(1, 0xffffff)
        this.时间高亮bg.beginFill(0x111111)
        this.时间高亮bg.drawRect(p.x - ww / 2, p.y, ww, theme.BOTTOM_HEIGHT)
        this.时间高亮bg.endFill()


        //文字
        this.时间高亮Text.x = p.x
        this.时间高亮Text.y = p.y + theme.BOTTOM_HEIGHT / 2
        this.时间高亮Text.text = p.str
    }

    render({ x, y, width, height, xStr, yStr }: { x: number, y: number, width: number, height: number, xStr: string, yStr: string }) {

        this.g.clear()
        this.g.lineStyle(1, 0xaaaaaa)


        if (this.visible && y < height && x < width) {
            //横线 y < height
            this.g.moveTo(0, y)
            this.g.lineTo(width, y)
            this.价格高亮render({
                str: yStr,
                x: width,
                y: y
            })

            //竖线 x < width
            this.g.moveTo(x, 0)
            this.g.lineTo(x, height)

            this.时间高亮render({
                str: xStr,
                x: x,
                y: height
            })
        } else {
            this.价格高亮render()
            this.时间高亮render()
        }
    }
}