import { Layer } from './Layer'
import { Graphics } from 'pixi.js'
import { Viewport, To } from '../type'

export type 画线LayerItem = {
    drawLine?: {
        color: number
        // x1 is index
        y1: number
        x2: number
        y2: number
    }
    leftDrawLineIndex?: number
}

export class 画线Layer extends Layer<{
    data: ArrayLike<画线LayerItem>
}>{

    private g = new Graphics()

    init() {
        this.addChild(this.g)
    }

    render(viewport: Viewport, to: To) {
        const { g, } = this
        const { left, right } = viewport
        const { data } = this.props

        g.clear()

        if (data.length === 0) return

        const startIndex = Math.max(0, Math.floor(left))
        const endIndex = Math.min(Math.round(right), data.length - 1)

        const { drawLine, leftDrawLineIndex } = data[endIndex]

        let i: number

        if (drawLine !== undefined) {
            i = endIndex
        }
        else if (leftDrawLineIndex !== undefined) {
            i = leftDrawLineIndex
        }
        else {
            return
        }

        while (true) {
            const { drawLine, leftDrawLineIndex } = data[i]

            if (drawLine !== undefined) {
                g.lineStyle(2, drawLine.color)
                g.moveTo(to.x(i), to.y(drawLine.y1))
                g.lineTo(to.x(drawLine.x2), to.y(drawLine.y2))
            }

            if (leftDrawLineIndex === undefined) break

            if (i < startIndex) break
            i = leftDrawLineIndex
        }
    }
}


