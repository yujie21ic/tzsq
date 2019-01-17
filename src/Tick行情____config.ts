import { RealDataBase } from './RealDataServer/RealDataBase'
import { layer, LayerItem } from './lib/Chart'
import { LineLayer } from './lib/Chart/Layer/LineLayer'
import { TextLayer } from './lib/Chart/Layer/TextLayer'
import { lastNumber } from './lib/F/lastNumber'
import { BarLayer } from './lib/Chart/Layer/BarLayer'
// import { 竖线Layer } from './lib/Chart/Layer/竖线Layer'
// import { 画线Layer } from './lib/Chart/Layer/画线Layer'


type D = RealDataBase['dataExt']['XBTUSD']
type ItemFunc = (d: D) => {
    heightPercentage: number
    yCoordinate?: '普通' | '对数'
    和下一张重叠?: boolean
    layerList: LayerItem[]
}[]


const 现货颜色 = 0xaaaa00
const 期货颜色 = 0xcc66ff
const 买颜色 = 0x48aa65
const 卖颜色 = 0xe56546



const 双价格 = (d: D) => [
    //layer(LineLayer, { data: d.现货减去价格, color: 现货颜色 }),
    layer(LineLayer, { data: d.期货.价格, color: 期货颜色 }),
    // layer(竖线Layer, { data: d.期货.真空信号涨, color: 买颜色 }),
    // layer(竖线Layer, { data: d.期货.真空信号跌, color: 卖颜色 }),
    // layer(画线Layer, { data: d.期货.阻力笔 }),
    layer(TextLayer, {
        text:
            `现货:${lastNumber(d.现货.价格).toFixed(2)} - ${d.现货减去.toFixed(2)} = ${lastNumber(d.现货减去价格).toFixed(2)}   ` +
            `期货:${lastNumber(d.期货.价格).toFixed(2)}      ` +
            `期货30秒内成交量:${d.期货30秒内成交量().toFixed(2)}万   ` +
            `期货波动率:${lastNumber(d.期货.波动率).toFixed(2)}`,
        color: 现货颜色
    })
]

const 成交量买卖 = (d: D) => [
    layer(LineLayer, { data: d.期货.成交量买, color: 买颜色 }),
    layer(LineLayer, { data: d.期货.成交量卖, color: 卖颜色 }),
    layer(TextLayer, {
        text:
            `期货成交量买:${(lastNumber(d.期货.成交量买) / 10000).toFixed(2)}万` + '   ' +
            `期货成交量卖:${(lastNumber(d.期货.成交量卖) / 10000).toFixed(2)}万`,
        color: 期货颜色
    })
]
const 成交量买卖曲线 = (d: D) => [
    layer(LineLayer, { data: d.期货.成交量均线1, color: 现货颜色 }),
    layer(LineLayer, { data: d.期货.成交量买, color: 买颜色 }),
    layer(LineLayer, { data: d.期货.成交量卖, color: 卖颜色 }),
    //layer(LineLayer, { data: d.期货.净成交量均线, color: 现货颜色 }),
    layer(TextLayer, {
        text:
            `30秒成交量曲线`,
        color: 现货颜色
    })
]

export const Tick行情____config: { [key in string]: ItemFunc } = {

    图表1: d => [
        {
            heightPercentage: 0.5,
            和下一张重叠: true,
            layerList: 双价格(d)
        },

        {
            heightPercentage: 0.5,
            yCoordinate: '对数',
            和下一张重叠: true,
            layerList: [
                layer(LineLayer, { data: d.期货.阻力4涨, color: 买颜色 }),
                // layer(LineLayer, { data: d.期货.阻力4跌, color: 卖颜色 }),
            ]
        },
        {
            heightPercentage: 0.,
            yCoordinate: '对数',
            layerList: [
                // layer(LineLayer, { data: d.期货.阻力4涨, color: 买颜色 }),
                layer(LineLayer, { data: d.期货.阻力4跌, color: 卖颜色 }),
            ]
        },
        // {
        //     heightPercentage: 0.5,
        //     yCoordinate: '对数',
        //     和下一张重叠: true,
        //     layerList: [
        //         layer(LineLayer, { data: d.期货.阻力3涨, color: 买颜色 }),
        //         layer(TextLayer, {
        //             text: `涨跌动力`,
        //             color: 现货颜色
        //         })
        //     ]
        // },
        // {
        //     heightPercentage: 0.5,
        //     layerList: [
        //         layer(LineLayer, { data: d.期货.阻力3跌, color: 卖颜色 }),
        //     ]
        // },
        {
            heightPercentage: 0.5,
            yCoordinate: '对数',
            和下一张重叠: true,
            layerList: 成交量买卖曲线(d)
        },
        {
            heightPercentage: 0.5,
            layerList: [
                layer(LineLayer, { data: d.期货.波动率, color: 期货颜色 }),
            ]
        },

    ],
    双价格图和成交量: d => [
        {
            heightPercentage: 0.5,
            layerList: 双价格(d)
        },
        {
            heightPercentage: 0.5,
            yCoordinate: '对数',
            layerList: 成交量买卖(d)
        },
    ],
    真空涨跌: d => [
        {
            heightPercentage: 0.5,
            layerList: 双价格(d)
        },
        {
            heightPercentage: 0.5,
            layerList: [
                layer(BarLayer, { data: d.期货.真空涨, color: 买颜色 }),
                layer(BarLayer, { data: d.期货.真空跌, color: 卖颜色 }),
                layer(TextLayer, {
                    text: `期货真空涨  ${lastNumber(d.期货.真空涨)} 期货真空跌  ${lastNumber(d.期货.真空跌)} `,
                    color: 期货颜色
                })
            ]
        },
    ]
}