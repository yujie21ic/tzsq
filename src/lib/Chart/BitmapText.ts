import { Container, Text, Texture, TextStyle, Sprite } from 'pixi.js'

const __dic__: { [key: string]: { [char: string]: Texture } } = Object.create(null)

const getTexture = (fontSize: number, fill: number, char: string) => {
    const key = JSON.stringify([fontSize, fill])

    if (__dic__[key] === undefined) {
        __dic__[key] = Object.create(null)
    }

    const textureDic = __dic__[key]

    if (textureDic[char] === undefined) {
        textureDic[char] = ((window as any)['pixiApplication']).renderer.generateTexture(
            new Text(char,
                new TextStyle({
                    fontSize: fontSize,
                    fill: fill,
                })
            )
        )
    }
    return textureDic[char]
}



export class BitmapText extends Container {

    private textContainer = new Container()

    private _fontSize: number
    private _fill: number
    private _anchor: {
        x: number
        y: number
    }

    constructor(p: {
        fontSize: number
        fill: number
        anchor: {
            x: number
            y: number
        }
    }) {
        super()

        this._fontSize = p.fontSize
        this._fill = p.fill
        this._anchor = p.anchor
        this.addChild(this.textContainer)
    }



    private _text = ''

    set fill(n: number) {
        if (this._fill !== n) {
            this._fill = n
            this.render()
        }
    }

    get text() {
        return this._text
    }

    set text(str: string) {
        if (this._text !== str) {
            this._text = str
            this.render()
        }
    }

    private render() {

        while (this.textContainer.children.length > 0) {
            this.textContainer.removeChildAt(0)
        }

        let startX = 0
        this._text.split('').forEach(v => {
            let sp = new Sprite(getTexture(this._fontSize, this._fill, v))
            this.textContainer.addChild(sp)

            sp.x = startX
            startX += sp.width
        })

        this.textContainer.x = -this.textContainer.width * this._anchor.x
        this.textContainer.y = -this.textContainer.height * this._anchor.y
    }
}