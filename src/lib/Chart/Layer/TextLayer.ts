import { Layer } from './Layer'
import { BitmapText } from '../BitmapText'
import { Viewport, To } from '../type'


export class TextLayer extends Layer<{ text: string, color: number }> {

    private bitmapText?: BitmapText


    init() {
        this.bitmapText = new BitmapText({
            fontSize: 16,
            fill: this.props.color,
            anchor: {
                x: 1,
                y: 0
            }
        })
        this.addChild(this.bitmapText)
    }

    render(viewport: Viewport, to: To) {
        const { width } = viewport
        if (this.bitmapText !== undefined) {
            this.bitmapText.text = this.props.text
            this.bitmapText.x = width - 10
            this.bitmapText.y = 10
        }
    }

    destroy() {
        if (this.bitmapText !== undefined) {
            this.bitmapText.destroy()
        }
    }
}