import { Viewport, To } from '../type'
import { Layer } from './Layer'
import { Graphics } from 'pixi.js'

export class 缠中说禅Layer extends Layer<{}> {

    private g = new Graphics()

    init() {
        this.addChild(this.g)
    }

    render(viewport: Viewport, to: To) {
        //笔  手动修正
        //合并后的
        //走势中枢
    }

}