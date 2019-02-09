import { Viewport, TopBottom, To } from '../type'
import { Layer } from './Layer'
import { Graphics } from 'pixi.js'
import { combineTopAndBottom } from '../combineTopAndBottom'
import { getTopAndBottomK } from '../getTopAndBottom'

const COLOR_UP = 0x48aa65
const COLOR_DOWN = 0xe56546

export class KLineLayer extends Layer<{ data: { open: number, close: number, high: number, low: number }[] }>{

    private g = new Graphics()

    init() {
        this.addChild(this.g)
    }

    render(viewport: Viewport, to: To) {
        this.g.clear()

        const { left, right } = viewport
        const { data } = this.props

        if (data.length === 0) return



        //start
        for (let i = Math.max(0, Math.floor(left)); i <= Math.min(Math.round(right), data.length - 1); i++) {
            const v = data[i]

            const openY = to.y(v.open)
            const closeY = to.y(v.close)
            const highY = to.y(v.high)
            const lowY = to.y(v.low)

            const x0 = to.x(i)
            const x1 = to.x(i - 0.3)
            const x2 = to.x(i + 0.3)

            this.g.beginFill(v.close > v.open ? COLOR_UP : COLOR_DOWN)

            //最高最低价
            this.g.drawRect(x0, highY, 1, Math.max(1, lowY - highY))

            //开盘收盘价
            this.g.drawRect(x1, v.open > v.close ? openY : closeY, Math.max(1, x2 - x1), Math.max(1, Math.abs(openY - closeY)))
            this.g.endFill()
        }
    }

    updateTopAndBottom = (viewport: Viewport, tb: TopBottom) =>
        combineTopAndBottom(
            tb, getTopAndBottomK(this.props.data)(viewport)
        )

}