import { remote } from 'electron'

export const setWindowTitle = (title: string) => {
    try {
        remote.getCurrentWindow().setTitle(title)
    } catch (error) {
        console.log('setTitle 出错', error)
    }
}