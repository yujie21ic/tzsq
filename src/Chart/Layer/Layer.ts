
import { Container } from 'pixi.js'
import { Viewport, TopBottom, To } from '../type'

export class Layer<P> extends Container {

    props: P

    constructor(props: P) {
        super()
        this.props = props

    }

    init() {

    }

    render(viewport: Viewport, to: To, tb: TopBottom) {

    }

    getRight() {
        return 0
    }

    updateTopAndBottom = (viewport: Viewport, tb: TopBottom) => tb
}