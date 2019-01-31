import { Graphics } from 'pixi.js'
import { Viewport, TopBottom, To } from '../type'
import { Layer } from './Layer'
import { combineTopAndBottom, combineTopAndBottom正负 } from '../combineTopAndBottom'
import { getTopAndBottom } from '../getTopAndBottom'

export class LineLayer extends Layer<{ data: ArrayLike<number>, color: number, 临时参数?: '倒过来显示' | '变成负数' }> {

    private g = new Graphics()

    init() {
        this.addChild(this.g)
    }

    render(viewport: Viewport, to: To, tb: TopBottom) {
        const { g } = this
        const { left, right } = viewport

        const { data, color, 临时参数 } = this.props

        if (data.length === 0) return

        g.clear()
        g.lineStyle(1, color)

        let hasMove = false

        for (let i = Math.max(0, Math.floor(left)); i <= Math.min(Math.round(right), data.length - 1); i++) {
            const v = data[i]
            if (isNaN(v)) continue

            const x = to.x(i)

            let y = to.y(v)
            if (临时参数 === '倒过来显示') {
                y = to.y(tb.top) + to.y(tb.bottom) - y
            }
            else if (临时参数 === '变成负数') {
                y = to.y(-v)
            }

            if (hasMove === false) {
                hasMove = true
                g.moveTo(x, y)
            } else {
                g.lineTo(x, y)
            }
        }
    }

    updateTopAndBottom = (viewport: Viewport, tb: TopBottom) => {
        const xx = getTopAndBottom(this.props.data)(viewport)
        if (this.props.临时参数 === '变成负数') {
            //     return combineTopAndBottom正负(tb, xx)
            xx.bottom = -xx.top
        } //else {
        return combineTopAndBottom(tb, xx)
        // }

    }

} 