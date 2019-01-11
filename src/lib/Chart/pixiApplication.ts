import { Application } from 'pixi.js'
export const pixiApplication = new Application({
    width: 800,
    height: 600,
    resolution: window.devicePixelRatio,
    autoResize: true,
    antialias: false,
    backgroundColor: 0x000000
})