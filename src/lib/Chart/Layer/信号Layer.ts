import { Graphics } from 'pixi.js'
import { Viewport, To } from '../type'
import { Layer } from './Layer'

export class 信号Layer extends Layer<{ data: ArrayLike<{ name: string, value: boolean }[]> }> {

    private g = new Graphics()

    init() {
        this.addChild(this.g)
    }

    render(viewport: Viewport, to: To) {
        const { g } = this
        const { left, right, height } = viewport

        const { data } = this.props

        if (data.length === 0) return

        const strArr = data[0].map(v => v.name)
        const oneH = height / strArr.length

        g.clear()
        g.lineStyle(1, 0xffffff)

        for (let i = Math.max(0, Math.floor(left)); i <= Math.min(Math.round(right), data.length - 1); i++) {
            const x = to.x(i)
            for (let j = 0; j < strArr.length; j++) {
                if (data[i][j].value) {
                    g.moveTo(x, oneH * j)
                    g.lineTo(x, oneH * (j + 1))
                }
            }
        }
    }
} 