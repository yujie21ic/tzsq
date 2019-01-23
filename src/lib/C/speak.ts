const dic = new Map<string, number>()

//同一个id一分钟内 只提醒一次
export const speak = (msg: string, id: string) => {

    const n = dic.get(id)
    if (n !== undefined && Date.now() - n < 60 * 1000) {
        console.log('没有提醒', Math.floor((Date.now() - n) / 1000), JSON.stringify({ body: msg }))
        return
    } else {
        console.log('提醒', JSON.stringify({ body: msg }))
    }

    dic.set(id, Date.now())
    speechSynthesis.speak(new SpeechSynthesisUtterance(msg))
    new Notification('提醒', { body: msg })
}