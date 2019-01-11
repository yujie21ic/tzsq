import { Graphics } from 'pixi.js'
import { Viewport, TopBottom, To } from '../type'
import { Layer } from './Layer'
import { combineTopAndBottom } from '../combineTopAndBottom'
import { getTopAndBottom } from '../getTopAndBottom'

export class LineLayer extends Layer<{ data: ArrayLike<number>, color: number }> {

    private g = new Graphics()

    init() {
        this.addChild(this.g)
    }

    render(viewport: Viewport, to: To) {
        const { g, } = this
        const { left, right } = viewport

        const { data, color } = this.props

        if (data.length === 0) return

        g.clear()
        g.lineStyle(1, color)

        let hasMove = false

        for (let i = Math.max(0, Math.floor(left)); i <= Math.min(Math.round(right), data.length - 1); i++) {
            const v = data[i]
            if (isNaN(v)) continue

            const x = to.x(i)
            const y = to.y(v)

            if (hasMove === false) {
                hasMove = true
                g.moveTo(x, y)
            } else {
                g.lineTo(x, y)
            }
        }
    }

    updateTopAndBottom = (viewport: Viewport, tb: TopBottom) =>
        combineTopAndBottom(
            tb, getTopAndBottom(this.props.data)(viewport)
        )

} 