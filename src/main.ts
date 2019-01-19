import * as path from 'path'
import { app, Menu, Tray } from 'electron'
import { kvs } from './lib/F/kvs'
import { config } from './config'
import { showWindow } from './windowExt'

const item = (name: string, accountName = '') => ({
  label: name,
  click: () => showWindow(name, accountName)
})

const menu = Menu.buildFromTemplate([
  item('盘口'),
  item('K线行情'),
  item('Tick行情'),
  item('Tick复盘'),
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