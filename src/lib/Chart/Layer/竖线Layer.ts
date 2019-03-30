import { Graphics } from 'pixi.js'
import { Viewport, To, TopBottom } from '../type'
import { Layer } from './Layer'

export class 竖线Layer extends Layer<{ data: ArrayLike<boolean>, color: number }> {

    private g = new Graphics()

    init() {
        this.addChild(this.g)
    }

    render(viewport: Viewport, to: To, tb: TopBottom) {
        const { g } = this
        g.clear()

        const { left, right } = viewport

        const { data, color } = this.props

        if (data.length === 0) return


        g.lineStyle(1, color)


        for (let i = Math.max(0, Math.floor(left)); i <= Math.min(Math.round(right), data.length - 1); i++) {
            if (data[i]) {
                const x = to.x(i)
                g.moveTo(x, to.y(tb.top))
                g.lineTo(x, to.y(tb.bottom))
            }
        }
    }

    getRight() {
        return this.props.data.length - 1
    }
} 