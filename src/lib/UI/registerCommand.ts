export const registerCommand = (name: string, help: string, func: (p: any) => void) => {
    if ((window as any)['c'] === undefined) {
        (window as any)['c'] = Object.create(null)
    }
    if ((window as any)['c'][name] !== undefined) {
        throw new Error('已经注册了')
    }

    const logHelp = () => console.log(`%c${name}命令 参数说明  ${help}`, 'color:#cc66ff;font-size:18px')

    Object.defineProperty((window as any)['c'], name, {
        get() {
            logHelp()
            return ''
        },
        set(p: any) {
            func(p)
        }
    })
}