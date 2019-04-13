import { app, BrowserWindow, Tray } from 'electron'
import * as path from 'path'
import { F } from './lib/F'

let tray: Tray //防止GC

app.on('ready', () => {

  let win = new BrowserWindow({
    width: 400,
    height: 600,
    show: false,
    resizable: false
  })

  win.on('close', e => {
    e.preventDefault()
    win.hide()
  })

  win.loadURL(`data:text/html;base64,${
    F.base64(`<!DOCTYPE html>
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
        body {
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
      </style>
    </head>    
    <body></body>
    <script> 
    require(${JSON.stringify(path.join(__dirname, `../build/home/index.js`))})
    </script>
    </html>`)
    }`)

  const showHide = () => {
    if (win.isVisible()) {
      win.hide()
    } else {
      win.show()
    }
  }

  tray = new Tray(path.join(__dirname, '../APP.png'))
  tray.on('right-click', showHide)
})