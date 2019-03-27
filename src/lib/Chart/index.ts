import { Application, Container } from 'pixi.js'
import { Layer } from './Layer/Layer'
import { Coordinate } from './Coordinate'
import { theme } from './theme'
import { Crosshairs } from './Crosshairs'
import { Viewport, To } from './type'
import { setWindowTitle } from '../F/setWindowTitle'

const 坐标刻度 = new Coordinate()
const layerContainer = new Container()
const 十字光标 = new Crosshairs()

let indexX = 0
let mouseX = 0
let mouseY = 0

type LayerClass<P> = {
    new(props: P): Layer<P>
}

export type LayerItem = [LayerClass<any>, any, '__用layer函数创建__']

export const getIndex = () => indexX

export const layer = <P extends any>(a: LayerClass<P>, b: P): LayerItem => [a, b] as any

type Item = {
    numberColor?: number
    numberX?: number
    yCoordinate?: '普通' | '对数'
    layerList: LayerItem[]
}

let dataSourceFunc: () => {
    title: string

    显示y: (v: number) => string | undefined
    xStrArr: ArrayLike<string>


    left: number
    right: number
    items: {
        heightList: number[]
        items: (Item | Item[])[]
    }
}

import PixiFps from 'pixi-fps'




export const chartInit = (element: HTMLElement, func: typeof dataSourceFunc) => {

    const pixiApplication = new Application({
        width: 800,
        height: 600,
        resolution: window.devicePixelRatio,
        autoResize: true,
        antialias: false,
        backgroundColor: 0x000000
    })

        ; ((window as any)['pixiApplication']) = pixiApplication

    pixiApplication.stage.addChild(坐标刻度)
    pixiApplication.stage.addChild(layerContainer)
    pixiApplication.stage.addChild(十字光标)
    pixiApplication.stage.addChild(new PixiFps())

    //
    window.addEventListener('mousemove', e => {
        mouseX = e.clientX
        mouseY = e.clientY
    })

    element.appendChild(pixiApplication.view)

    const onResize = () => pixiApplication.renderer.resize(document.body.clientWidth - theme.右边空白, document.body.clientHeight)

    window.addEventListener('resize', onResize)

    setTimeout(onResize, 0) //pixi.js 一闪一闪的 bug   

    dataSourceFunc = func


    const FPS = 20

    if (FPS >= 60) {
        pixiApplication.ticker.add(chartRender)
    } else {
        setInterval(chartRender, 1000 / FPS)
    }
    //setInterval(chartRender, 1000 / FPS)



    window.addEventListener('mouseover', () => 十字光标.visible = true)
    window.addEventListener('mouseout', () => 十字光标.visible = false)
}



let lastTitle = ''


//
const layerCache = new Map<LayerClass<any>, Layer<any>[]>()

const popLayer = (c: LayerClass<any>, p: any) => {

    if (layerCache.has(c) === false) {
        layerCache.set(c, [])
    }

    const arr = layerCache.get(c)!
    if (arr.length > 0) {
        const layer = arr.pop() as Layer<any>
        layer.props = p
        return layer
    } else {
        const layer = new c(p)
            ; (layer as any)['__xxx__'] = c //!!!
        layer.init()
        return layer
    }
}

const pushLayer = (layer: Layer<any>) => {
    const c = (layer as any)['__xxx__'] //!!!

    if (layerCache.has(c) === false) {
        layerCache.set(c, [])
    }

    const arr = layerCache.get(c)!
    arr.push(layer)
}
//

const chartRender = () => {
    if (dataSourceFunc === undefined) return

    let { title, xStrArr, 显示y, left, right, items } = dataSourceFunc()

    if (lastTitle !== title) {
        lastTitle = title
        setWindowTitle(title)
    }

    const width = document.body.clientWidth - theme.右边空白 - theme.RIGHT_WIDTH
    const height = document.body.clientHeight - theme.BOTTOM_HEIGHT

    indexX = Math.round(left + (right - left) * (mouseX / width))

    坐标刻度.clear()
    坐标刻度.drawH(width, height)


    const toX = (value: number) => (value - left) / (right - left) * width

    for (let i = Math.floor(left); i <= Math.floor(right); i++) {
        const msg = 显示y(i)
        if (msg !== undefined) {
            坐标刻度.drawTemp(toX(i), height, msg)
        }
    }


    while (layerContainer.children.length > 0) {
        pushLayer(layerContainer.removeChildAt(0) as Layer<any>)
    }

    let price = NaN
    let startY = 0

    const aaa = (v: Item, heightPercentage: number) => {
        //layerList new
        const layerList = v.layerList.map(([C, P]) => popLayer(C, P))


        //updateTopAndBottom
        const viewport: Viewport = {
            width: width,
            height: height * heightPercentage,
            left: left,
            right: right
        }
        let tb = {
            top: -Number.MAX_VALUE,
            bottom: Number.MAX_VALUE
        }
        layerList.forEach(layer => tb = layer.updateTopAndBottom(viewport, tb))

        //1 1
        if (tb.top === tb.bottom) {
            tb.top += 1
            tb.bottom -= 1
        }




        const 上面加空隙 = 40
        const 下面加空隙 = 5
        const layerHeight = height * heightPercentage

        const toY = (value: number) => {
            let n = (value - tb.bottom) / (tb.top - tb.bottom) //0--1
            if (v.yCoordinate === '对数') { //重复
                n = Math.log10(1 + n * 9)
            }
            return 上面加空隙 + (layerHeight - 上面加空隙 - 下面加空隙) * (1 - n)
        }

        const toValue = (y: number) => {
            let n = (y - 上面加空隙) / (layerHeight - 上面加空隙 - 下面加空隙)
            if (v.yCoordinate === '对数') { //重复
                n = Math.log10(1 + n * 9)
            }
            return tb.top - (tb.top - tb.bottom) * n
        }

        const to: To = {
            x: toX,
            y: toY,
        }

        坐标刻度.render({
            numberColor: v.numberColor,
            numberX: v.numberX,
            startY,
            width,
            height: layerHeight,
            top: tb.top,
            bottom: tb.bottom,
            toY: to.y
        })

        if (mouseY - startY > 0 && mouseY - startY < layerHeight) {
            price = toValue(mouseY - startY)
        }

        //layer render
        layerList.forEach(layer => {
            layer.x = 0
            layer.y = startY
            layer.render(viewport, to, tb)
            layerContainer.addChild(layer)
        })
    }

    items.items.forEach((v, i) => {

        if (v instanceof Array) {
            v.forEach(v => aaa(v, items.heightList[i]))
        } else {
            aaa(v, items.heightList[i])
        }

        startY += height * items.heightList[i]

    })


    十字光标.render({
        x: (indexX - left) / (right - left) * width,
        y: mouseY,
        width,
        height,
        xStr: indexX > xStrArr.length - 1 || indexX < 0 ? '' : xStrArr[indexX],
        yStr: price.toFixed(2)
    })

}