import * as path from 'path'
import { app, Menu, Tray } from 'electron'
import { kvs } from './lib/F/kvs'
import { config } from './config'
import { showWindow } from './windowExt'


const menu = Menu.buildFromTemplate([
  {
    label: '测试',
    click: () => showWindow('测试', {}),
  },
  ...kvs(config.account || {}).map(v => ({
    label: v.k,
    submenu: [
      {
        label: 'HopexKLine',
        click: () => showWindow('HopexKLine', { accountName: v.k })
      },
      {
        label: `盘口`,
        click: () => showWindow('盘口', { accountName: v.k })
      },
      {
        label: `计分板`,
        click: () => showWindow('计分板', { accountName: v.k })
      },
      {
        label: '复盘',
        click: () => showWindow('复盘', { accountName: v.k })
      },
      {
        label: `实盘`,
        click: () => showWindow('实盘', { accountName: v.k })
      },
    ]
  })),
  { type: 'separator' },
  { label: '退出', click: () => app.exit() }
])


let tray: Tray //防止GC 
app.on('ready', () => {
  tray = new Tray(path.join(__dirname, '../APP.png'))
  tray.setContextMenu(menu)
})