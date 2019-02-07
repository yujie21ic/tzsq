import { Container, Text, Texture, TextStyle, Sprite } from 'pixi.js'

export class BitmapText extends Container {
    private static __dic__: { [key: string]: { [char: string]: Texture } } = Object.create(null)
    private textureDic: { [char: string]: Texture }
    private textContainer = new Container()
    private style: TextStyle

    private anchor: {
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

        this.addChild(this.textContainer)

        this.style = new TextStyle({
            fontSize: p.fontSize,
            fill: p.fill
        })
        this.anchor = p.anchor

        const key = JSON.stringify([p.fontSize, p.fill])

        if (BitmapText.__dic__[key] === undefined) {
            BitmapText.__dic__[key] = Object.create(null)
        }

        this.textureDic = BitmapText.__dic__[key]
    }

    private getTexture(char: string) {
        if (this.textureDic[char] === undefined) {
            this.textureDic[char] = ((window as any)['pixiApplication']).renderer.generateTexture(new Text(char, this.style))
        }
        return this.textureDic[char]
    }

    private _text = ''

    set fill(n: number) {
        //TODO
    }

    get text() {
        return this._text
    }

    set text(str: string) {
        if (this._text !== str) {
            this._text = str

            while (this.textContainer.children.length > 0) {
                this.textContainer.removeChildAt(0)
            }

            let startX = 0
            str.split('').forEach(v => {
                let sp = new Sprite(this.getTexture(v))
                this.textContainer.addChild(sp)

                sp.x = startX
                startX += sp.width
            })

            this.textContainer.x = -this.textContainer.width * this.anchor.x
            this.textContainer.y = -this.textContainer.height * this.anchor.y
        }
    }
}