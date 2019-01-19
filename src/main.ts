import * as path from 'path'
import { app, Menu, Tray } from 'electron'
import { kvs } from './lib/F/kvs'
import { config } from './config'
import { showWindow } from './windowExt'


const menu = Menu.buildFromTemplate([

  { label: '盘口', click: () => showWindow('盘口', {}) },
  { label: 'K线行情', click: () => showWindow('K线行情', {}) },
  { label: 'Tick行情', click: () => showWindow('Tick行情', {}) },
  { label: 'Tick复盘', click: () => showWindow('Tick复盘', {}) },
  { label: '提醒', click: () => showWindow('提醒', {}) },
  { type: 'separator' },
  ...kvs(config.account || {}).map(v => ({
    label: v.k,
    submenu: [
      { label: '计分板', click: () => showWindow('计分板', { accountName: v.k }) },
      { label: '交易', click: () => showWindow('交易', { accountName: v.k }) },
    ],
  })),
  { type: 'separator' },
  { label: '退出', click: () => app.exit() }
])


let tray: Tray //防止GC 
app.on('ready', () => {
  tray = new Tray(path.join(__dirname, '../APP.png'))
  tray.setContextMenu(menu)
})