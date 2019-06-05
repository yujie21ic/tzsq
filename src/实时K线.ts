import { theme } from './Chart/theme'
import { RealKLineChart } from './RealKLineChart'
import { BinanceRealKLine } from './RealDataServer/RealKLine/BinanceRealKLine'

theme.右边空白 = 0
RealKLineChart(document.querySelector('#root') as HTMLElement, new BinanceRealKLine())