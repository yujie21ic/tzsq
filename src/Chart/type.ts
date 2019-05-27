export type LeftRight = {
    left: number
    right: number
}

export type TopBottom = {
    top: number
    bottom: number
}

export type Viewport = {
    left: number
    right: number
    width: number
    height: number
}

export type To = {
    x: (value: number) => number
    y: (value: number) => number
}