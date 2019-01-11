import { Layer } from './Layer'
import { Graphics } from 'pixi.js'
import { Viewport, To } from '../type'

export class 笔Layer extends Layer<{
    data:
    {
        index: number
        value: number
    }[]
    color: number
}>{


    private g = new Graphics()

    init() {
        this.addChild(this.g)
    }

    render(viewport: Viewport, to: To) {

        const { data, color } = this.props

        this.g.clear()
        this.g.lineStyle(2, color)
        let hasMove = false

        data.forEach(v => {

            const x = to.x(v.index)
            const y = to.y(v.value)

            if (hasMove === false) {
                hasMove = true
                this.g.moveTo(x, y)
            } else {
                this.g.lineTo(x, y)
            }

        })

    }
}


