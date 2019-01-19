import * as path from 'path'
import { app, Menu, Tray, BrowserWindow } from 'electron'
import { kvs } from './lib/F/kvs'
import { base64 } from './lib/F/base64'
import { config } from './config'

const html转义 = (s: string) => s //居然没有这个现成的函数  这里没实现

const base64URL = (jsPath: string, accountName: string) => `data:text/html;base64,${
  base64(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title></title>  
  <style>
    * {
      margin: 0;
      padding: 0;
    }    
    html,
    body,#root {
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
  </style>
</head>    
<body><div id="root"></div></body>
<script> 
window['windowExt'] = ${html转义(JSON.stringify({ accountName }))}
document.body.ondragenter = document.body.ondragover = document.body.ondrop = e => {
  e.stopPropagation()
  e.preventDefault()
}
require(${html转义(JSON.stringify(jsPath))})
</script>
</html>`)}`


const show = (name: string, accountName: string) => {
  const win = new BrowserWindow({
    width: 550,
    height: 400,
    title: accountName === '' ? name : name + ' ' + accountName,
  })
  win.loadURL(base64URL(path.join(__dirname, `../build/${name}.js`), accountName))
}

const item = (name: string, accountName = '') => ({
  label: name,
  click: () => show(name, accountName)
})

const menu = Menu.buildFromTemplate([
  item('盘口'),
  item('K线行情'),
  item('Tick行情'),
  item('提醒'),
  { type: 'separator' },
  ...kvs(config.account || {}).map(v => ({
    label: v.k,
    submenu: [
      item('计分板', v.k),
      item('交易', v.k),
    ],
  })),
  { type: 'separator' },
  {
    label: '退出',
    click: () => app.exit()
  }
])


let tray: Tray //防止GC 
app.on('ready', () => {
  tray = new Tray(path.join(__dirname, '../APP.png'))
  tray.setContextMenu(menu)
})