import { Graphics } from 'pixi.js'
import { Viewport, TopBottom, To } from '../type'
import { Layer } from './Layer'

export class ZeroLayer extends Layer<{ color: number }> {

    private g = new Graphics()

    init() {
        this.addChild(this.g)
    }

    render(viewport: Viewport, to: To, tb: TopBottom) {
        const { g } = this
        const { color } = this.props
        const { width } = viewport

        g.clear()
        g.lineStyle(1, color)

        const y = to.y(0)

        g.moveTo(0, y)
        g.lineTo(width, y)

    }

} 