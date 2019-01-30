import { Application, Container } from 'pixi.js'
import { Layer } from './Layer/Layer'
import { Coordinate } from './Coordinate'
import { theme } from './theme'
import { Crosshairs } from './Crosshairs'
import { Viewport, To } from './type'
import { formatDate } from '../F/formatDate'
import { setWindowTitle } from '../C/setWindowTitle'

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

let dataSourceFunc: () => {
    title: string
    startTime: number
    显示y: (v: number) => string | undefined
    每一根是: number
    left: number
    right: number
    items: {
        numberColor?: number
        numberX?: number
        yCoordinate?: '普通' | '对数'
        heightPercentage: number
        和下一张重叠?: boolean
        layerList: LayerItem[]
    }[]
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


    // 60fps
    // pixiApplication.ticker.add(chartRender)


    // 10fps
    setInterval(chartRender, 1000 / 10)


    window.addEventListener('mouseover', () => 十字光标.visible = true)
    window.addEventListener('mouseout', () => 十字光标.visible = false)
}



let lastTitle = ''

const chartRender = () => {
    if (dataSourceFunc === undefined) return

    let { title, startTime, 每一根是, 显示y, left, right, items } = dataSourceFunc()

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
        (layerContainer.removeChildAt(0) as Layer<any>).destroy()
    }

    let price = NaN
    let startY = 0

    items.forEach(v => {

        //layerList new
        const layerList = v.layerList.map(([C, P]) => new C(P))

        //init
        layerList.forEach(layer => layer.init())


        //updateTopAndBottom
        const viewport: Viewport = {
            width: width,
            height: height * v.heightPercentage,
            left: left,
            right: right
        }
        let tb = {
            top: -Number.MAX_VALUE,
            bottom: Number.MAX_VALUE
        }
        layerList.forEach(layer => tb = layer.updateTopAndBottom(viewport, tb))




        const 上面加空隙 = 40
        const 下面加空隙 = 5
        const layerHeight = height * v.heightPercentage

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

        if (v.和下一张重叠 !== true) {
            startY += height * v.heightPercentage
        }
    })


    十字光标.render({
        x: (indexX - left) / (right - left) * width,
        y: mouseY,
        width,
        height,
        xStr: formatDate(new Date(startTime + indexX * 每一根是), v => `${v.hh}:${v.mm}:${v.ss}:${v.msmsms}`),
        yStr: price.toFixed(2)
    })

}