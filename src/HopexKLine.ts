import { theme } from './lib/Chart/theme'
import { HopexRealKLine } from './RealDataServer/HopexRealKLine'
import { RealKLineChart } from './RealKLineChart'

theme.右边空白 = 0
const real = new HopexRealKLine()
RealKLineChart(real)