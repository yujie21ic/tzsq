import { BaseType } from '../BaseType'

export const get成交性质 = (p: { side: BaseType.Side, 持仓量新增: number, 成交量: number }): BaseType.成交性质Type => {



    if (p.持仓量新增 === p.成交量) {
        return '双开'
    }
    else if (p.持仓量新增 === -p.成交量) {
        return '双平'
    }
    else if (p.持仓量新增 === 0 && p.side === 'Buy') {
        return '多换'
    }
    else if (p.持仓量新增 === 0 && p.side === 'Sell') {
        return '空换'
    }


    // 这4个  咋区分 ？？
    // '多平' | '空平' | '空开' | '多开'


}