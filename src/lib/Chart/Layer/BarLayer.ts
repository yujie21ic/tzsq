import { Graphics } from 'pixi.js'
import { Viewport, TopBottom, To } from '../type'
import { Layer } from './Layer'
import { combineTopAndBottom } from '../combineTopAndBottom'
import { getTopAndBottom } from '../getTopAndBottom'

export class BarLayer extends Layer<{ data: ArrayLike<number>, color: number }> {

    private g = new Graphics()

    init() {
        this.addChild(this.g)
    }

    render(viewport: Viewport, to: To) {
        const { g } = this
        const { left, right } = viewport

        const { data, color } = this.props

        if (data.length === 0) return

        g.clear()
        g.lineStyle(0)
        g.beginFill(color)

        const y0 = to.y(0)

        for (let i = Math.max(0, Math.floor(left)); i <= Math.min(Math.round(right), data.length - 1); i++) {
            const v = data[i]
            if (isNaN(v)) continue
            const y1 = to.y(v)
            const x1 = to.x(i - 0.3)
            const x2 = to.x(i + 0.3)
            g.drawRect(x1, y0, Math.max(1, x2 - x1), y1 - y0)
        }
        g.endFill()
    }

    updateTopAndBottom = (viewport: Viewport, tb: TopBottom) =>
        combineTopAndBottom(
            tb, getTopAndBottom(this.props.data)(viewport)
        )
}