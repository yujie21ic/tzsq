import { theme } from './Chart/theme'
import { HopexRealKLine } from './RealDataServer/HopexRealKLine'
import { RealKLineChart } from './RealKLineChart'

theme.右边空白 = 0
RealKLineChart(document.querySelector('#root') as HTMLElement, new HopexRealKLine())