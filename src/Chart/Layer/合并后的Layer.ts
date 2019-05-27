import { Layer } from './Layer'
import { Graphics } from 'pixi.js'
import { Viewport, To } from '../type'

export class 合并后的Layer extends Layer<{
    data: ({ startIndex: number, endIndex: number } & {
        high: number
        low: number
    })[]
    color: number
}> {

    private g = new Graphics()

    init() {
        this.addChild(this.g)
    }

    render(viewport: Viewport, to: To) {

        const { data, color } = this.props

        this.g.clear()
        this.g.beginFill(color, 0.3)

        data.forEach(v => {
            const x1 = to.x(v.startIndex - 0.3)
            const x2 = to.x(v.endIndex + 0.3)
            const highY = to.y(v.high)
            const lowY = to.y(v.low)
            this.g.drawRect(x1, highY, Math.max(1, x2 - x1), Math.max(1, lowY - highY))
        })
        this.g.endFill()
    }
} 