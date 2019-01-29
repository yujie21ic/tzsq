import { Container, Text, TextStyle } from 'pixi.js'

export class BitmapText extends Container {

    private _text: Text
    private _anchor: { x: number, y: number }

    constructor(p: {
        fontSize: number
        fill: number
        anchor: {
            x: number
            y: number
        }
    }) {
        super()

        this._anchor = p.anchor

        this._text = new Text('', new TextStyle({
            fontSize: p.fontSize,
            fill: p.fill,
        }))
        this.addChild(this._text)
    }

    set fill(n: number) {
        if (n !== this._text.style.fill) {
            this._text.cacheAsBitmap = false
            this._text.style = new TextStyle({
                fontSize: this._text.style.fontSize,
                fill: n,
            })
            this._text.cacheAsBitmap = true
        }
    }


    get text() {
        return this._text.text
    }

    set text(str: string) {
        if (this._text.text !== str) {
            this._text.cacheAsBitmap = false
            this._text.text = str
            this._text.cacheAsBitmap = true
            this._text.x = -this._text.width * this._anchor.x
            this._text.y = -this._text.height * this._anchor.y
        }
    }
} 