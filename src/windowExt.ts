import { typeObjectParse } from './lib/F/typeObjectParse'
import { BaseType } from './lib/BaseType'
import { base64 } from './lib/F/base64'
import { BrowserWindow, remote } from 'electron'
import * as path from 'path'

export const windowExt = typeObjectParse({
  accountName: '',
  symbol: 'XBTUSD' as BaseType.BitmexSymbol,
  startTime: 0,
})(typeof window === 'undefined' ? {} : (window as any)['windowExt'])

const html转义 = (s: string) => s //居然没有这个现成的函数  这里没实现

const base64URL = (jsPath: string, props: Partial<typeof windowExt>) => `data:text/html;base64,${
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
window['windowExt'] = ${html转义(JSON.stringify(props))}
document.body.ondragenter = document.body.ondragover = document.body.ondrop = e => {
  e.stopPropagation()
  e.preventDefault()
}
require(${html转义(JSON.stringify(jsPath))})
</script>
</html>`)}` 

export const showWindow = (name: string, props: Partial<typeof windowExt>, maximize = false) => {
  const CLASS = typeof window === 'undefined' ? BrowserWindow : remote.BrowserWindow
  const win = new CLASS({
    width: 550,
    height: 400,
    title: name + (props.accountName !== undefined ? ' ' + props.accountName : ''),
  })
  win.loadURL(base64URL(path.join(__dirname, `../build/${name}.js`), props))
  if (maximize) win.maximize()
}