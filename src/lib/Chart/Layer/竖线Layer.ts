import { Graphics } from 'pixi.js'
import { Viewport, To, TopBottom } from '../type'
import { Layer } from './Layer'

export class 竖线Layer extends Layer<{ data: ArrayLike<number>, color: number }> {

    private g = new Graphics()

    init() {
        this.addChild(this.g)
    }

    render(viewport: Viewport, to: To, tb: TopBottom) {
        const { g, } = this
        const { left, right } = viewport

        const { data, color } = this.props

        if (data.length === 0) return

        g.clear()
        g.lineStyle(1, color)


        for (let i = Math.max(0, Math.floor(left)); i <= Math.min(Math.round(right), data.length - 1); i++) {
            if (data[i] === 1) {
                const x = to.x(i)
                g.moveTo(x, to.y(tb.top))
                g.lineTo(x, to.y(tb.bottom))
            }
        }
    }
} 