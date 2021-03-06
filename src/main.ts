import * as path from 'path'
import { app, Menu, Tray } from 'electron'
import { kvs } from './F/kvs'
import { config } from './config'
import { showWindow } from './windowExt'


const menu = Menu.buildFromTemplate([
  {
    label: '测试',
    click: () => showWindow('测试', {}),
  },
  {
    label: '实时K线',
    click: () => showWindow('实时K线', {})
  },
  {
    label: '复盘',
    click: () => showWindow('复盘', {})
  },
  ...kvs(config.account || {}).map(v => ({
    label: v.k,
    submenu: [
      {
        label: `资金曲线`,
        click: () => showWindow('资金曲线', { accountName: v.k })
      },
      {
        label: `实盘`,
        click: () => showWindow('实盘', { accountName: v.k })
      },
      {
        label: `模拟盘`,
        click: () => showWindow('模拟盘', { accountName: v.k })
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