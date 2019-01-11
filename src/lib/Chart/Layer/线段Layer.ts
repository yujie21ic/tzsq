import { Layer } from './Layer'
import { Graphics } from 'pixi.js'
import { Viewport, To } from '../type'

export class 线段Layer extends Layer<{
    data: {
        start: {
            index: number
            value: number
        }
        end: {
            index: number
            value: number
        }
    }[]
    color: number
}> {

    private g = new Graphics()

    init() {
        this.addChild(this.g)
    }

    render(viewport: Viewport, to: To) {

        const { data, color } = this.props

        this.g.clear()
        this.g.lineStyle(5, color)

        data.forEach(v => {
            this.g.moveTo(to.x(v.start.index), to.y(v.start.value))
            this.g.lineTo(to.x(v.end.index), to.y(v.end.value))
        })

    }
}


