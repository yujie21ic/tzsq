import { Layer } from './Layer'
import { Graphics } from 'pixi.js'
import { Viewport, To } from '../type'

export type 画线LayerItem = {
    drawLine: {
        color: number
        // x1 is index
        y1: number
        x2: number
        y2: number
    }
    leftDrawLineIndex?: number
    righDrawLineIndex?: number
}

export class 画线Layer extends Layer<{
    data: 画线LayerItem[]
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

        const startIndex = Math.max(0, Math.floor(left))
        const endIndex = Math.min(Math.round(right), data.length - 1)

        const { drawLine, leftDrawLineIndex, righDrawLineIndex } = data[startIndex]

        let i: number

        if (leftDrawLineIndex !== undefined) {
            i = leftDrawLineIndex
        }
        else if (drawLine !== undefined) {
            i = startIndex
        }
        else if (righDrawLineIndex !== undefined) {
            i = righDrawLineIndex
        } else {
            return
        }

        while (true) {
            if (i > endIndex) break

            const { drawLine, righDrawLineIndex } = data[i]
            if (drawLine === undefined) break

            g.lineStyle(1, drawLine.color)
            g.moveTo(to.x(i), to.y(drawLine.y1))
            g.lineTo(to.x(drawLine.x2), to.y(drawLine.y2))

            if (righDrawLineIndex === undefined) break
            i = righDrawLineIndex
        }

    }
}


