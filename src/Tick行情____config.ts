import { RealDataBase } from './RealDataServer/RealDataBase'
import { layer, LayerItem } from './lib/Chart'
import { LineLayer } from './lib/Chart/Layer/LineLayer'
import { TextLayer } from './lib/Chart/Layer/TextLayer'
import { lastNumber } from './lib/F/lastNumber'
import { BarLayer } from './lib/Chart/Layer/BarLayer'
// import { 竖线Layer } from './lib/Chart/Layer/竖线Layer'
// import { 画线Layer } from './lib/Chart/Layer/画线Layer'


type D = RealDataBase['dataExt']['XBTUSD']
type D2 = RealDataBase['dataExt']

type ItemFunc = (d: D, d2: D2) => {
    heightPercentage: number
    yCoordinate?: '普通' | '对数'
    和下一张重叠?: boolean
    layerList: LayerItem[]
}[]


const ETH颜色 = 0xaaaa00
const BTC颜色 = 0xcc66ff
const 买颜色 = 0x0E6655
const 买颜色1 = 0x16A085
const 卖颜色 = 0x943126
const 卖颜色1 = 0xE74C3C
// const 买颜色 = 0x48aa65
// const 卖颜色 = 0xe56546
const 波动率颜色 = 0xC70039
const 净盘口颜色 = 0xEB95D8




const 双价格 = (d: D, d2: D2) => [
    //layer(LineLayer, { data: d.现货减去价格, color: ETH颜色 }),
    layer(LineLayer, { data: d.期货.价格, color: BTC颜色 }),
    // layer(竖线Layer, { data: d.期货.真空信号涨, color: 买颜色 }),
    // layer(竖线Layer, { data: d.期货.真空信号跌, color: 卖颜色 }),
    // layer(画线Layer, { data: d.期货.阻力笔 }),
    layer(TextLayer, {
        text:
            `现货:${lastNumber(d.现货.价格).toFixed(2)} - ${d.现货减去.toFixed(2)} = ${lastNumber(d.现货减去价格).toFixed(2)}   ` +
            `期货:${lastNumber(d.期货.价格).toFixed(2)}      ` +
            `期货30秒内成交量:${d.期货30秒内成交量().toFixed(2)}万   ` +
            `期货波动率:${lastNumber(d.期货.波动率).toFixed(2)}`,
        color: ETH颜色
    })
]

const 成交量买卖 = (d: D, d2: D2) => [
    layer(LineLayer, { data: d.期货.成交量买, color: 买颜色 }),
    layer(LineLayer, { data: d.期货.成交量卖, color: 卖颜色 }),
    layer(TextLayer, {
        text:
            `期货成交量买:${(lastNumber(d.期货.成交量买) / 10000).toFixed(2)}万` + '   ' +
            `期货成交量卖:${(lastNumber(d.期货.成交量卖) / 10000).toFixed(2)}万`,
        color: BTC颜色
    })
]
const 成交量买卖曲线 = (d: D, d2: D2) => [
    layer(LineLayer, { data: d.期货.成交量均线1, color: BTC颜色 }),
    //layer(LineLayer, { data: d2.ETHUSD.期货.成交量均线1, color: ETH颜色 }),
    layer(LineLayer, { data: d.期货.成交量买均线1, color: 买颜色 }),
    layer(LineLayer, { data: d.期货.成交量卖均线1, color: 卖颜色 }),
    //layer(LineLayer, { data: d.期货.净成交量均线, color: ETH颜色 }), 
]

// const 成交量买卖速度曲线 = (d: D, d2: D2) => [
//     layer(LineLayer, { data: d.期货.成交次数卖, color: 卖颜色 }),
//     layer(LineLayer, { data: d.期货.成交次数买, color: 买颜色 }),

//     layer(TextLayer, {
//         text:
//             `30秒成交量曲线`,
//         color: ETH颜色
//     })
// ]

export const Tick行情____config: { [key in string]: ItemFunc } = {

    图表1: (d, d2) => [
        // {
        //     heightPercentage: 0.4,
        //     和下一张重叠: true,
        //     numberX: 100,
        //     yCoordinate: '对数',
        //     layerList: [
        //         layer(LineLayer, { data: d.期货.成交量均线买3, color: 买颜色1 }),
        //         layer(LineLayer, { data: d.期货.成交量均线卖3, color: 卖颜色1, 临时参数: '倒过来显示' }),
        //         //layer(LineLayer, { data: d.期货.成交量均线卖3, color: 卖颜色1}),
        //         //layer(LineLayer, { data: d.期货.净盘口, color: 净盘口颜色 }),
        //     ]
        // },
        {
            heightPercentage: 0.4,
            numberColor: BTC颜色,
            和下一张重叠: true,
            layerList: [
                layer(LineLayer, { data: d2.XBTUSD.期货.价格, color: BTC颜色 }),
              
                layer(TextLayer, {
                    text:
                        `hopex:${lastNumber(d2.XBTUSD.hopex.价格).toFixed(2)}  ` +
                        `bitmex:${lastNumber(d.期货.价格).toFixed(2)}      ` +
                        `期货30秒内成交量:${d.期货30秒内成交量().toFixed(2)}万   ` +
                        `期货波动率:${lastNumber(d.期货.波动率).toFixed(2)}`,
                    color: d === d2.XBTUSD ? BTC颜色 : ETH颜色,
                })

            ]
        },
        {
            heightPercentage: 0.4,
           和下一张重叠: true,
            layerList: [
                layer(LineLayer, { data: d2.XBTUSD.hopex.价格, color: ETH颜色 }),
            ]
        },
        {
            heightPercentage: 0.4,
            numberColor: 波动率颜色,
            numberX: 100,
            layerList: [
                layer(LineLayer, { data: d.期货.波动率, color: 波动率颜色 }),
            ]
        },
        // {
        //     heightPercentage: 0.4,
        //     //和下一张重叠: true,
        //     layerList: [
        //         layer(LineLayer, { data: d.期货.卖MACD.DEM1, color: 买颜色 }),
        //         layer(LineLayer, { data: d.期货.卖MACD.DIF1, color: 卖颜色 }),
        //         //layer(BarLayer,{ data: d.期货.MACD.OSC, color: BTC颜色 })
              
        //     ]
        // },
        // {
        //     heightPercentage: 0.4,
        //     //和下一张重叠: true,
        //     layerList: [
              
        //         layer(LineLayer,{ data: d.期货.成交量均线卖3, color: ETH颜色 })
        //     ]
        // },
        // {
        //     heightPercentage: 0.4,
        //    //和下一张重叠: true,
        //     layerList: [
        //         layer(LineLayer, { data: d.期货.净盘口, color: 净盘口颜色 }),
        //     ]
        // },



        // {
        //     heightPercentage: 0.4,
        //     numberColor: ETH颜色,
        //     numberX: 100,
        //     layerList: [
        //         layer(LineLayer, { data: d2.ETHUSD.期货.价格, color: ETH颜色 })
        //     ]
        // },
        {
            heightPercentage: 0.3,
            //和下一张重叠: true,
            layerList: [
                
                layer(LineLayer, { data: d.期货.盘口买, color: 买颜色 }),
                layer(LineLayer, { data: d.期货.盘口卖, color: 卖颜色, 临时参数: '变成负数' }),
                layer(LineLayer, { data: d.期货.净盘口, color: BTC颜色 }),
                layer(LineLayer, { data: d.期货.净盘口均线, color: ETH颜色 }),
            ]
        },
        {
            heightPercentage: 0.3,
            //和下一张重叠: true,
            layerList: [
                layer(LineLayer, { data: d.期货.买MACD.DEM, color: 买颜色 }),
                layer(LineLayer, { data: d.期货.买MACD.DIF, color: 买颜色1 }),
                layer(LineLayer, { data: d.期货.卖MACD.DEM1, color: 卖颜色 }),
                layer(LineLayer, { data: d.期货.卖MACD.DIF1, color: 卖颜色1 }),
            ]
        },
        // {
        //     heightPercentage: 0.3,
        //     //和下一张重叠: true,
        //     layerList: [
               
        //         //layer(BarLayer,{ data: d.期货.MACD.OSC, color: BTC颜色 })
              
        //     ]
        // },
        // {
        //     heightPercentage: 0.3,
        //     和下一张重叠: true,
        //     layerList: [
        //         layer(LineLayer,{ data: d.期货.成交量均线买3, color: ETH颜色 })
        //     ]
        // },
        //  {
        //     heightPercentage: 0.3,
        //     //yCoordinate: '对数',
        //     和下一张重叠: true,
        //     layerList: [
        //         layer(LineLayer, { data: d.期货.成交量均线1, color: ETH颜色 }),
        //     ]
        // },

        // {
        //     heightPercentage: 0.3,
        //     //yCoordinate: '对数',
        //     和下一张重叠: true,
        //     layerList: 成交量买卖曲线(d, d2)
        // },
       

    ],
    双价格图和成交量: (d, d2) => [
        {
            heightPercentage: 0.5,
            layerList: 双价格(d, d2)
        },
        {
            heightPercentage: 0.5,
            yCoordinate: '对数',
            layerList: 成交量买卖(d, d2)
        },
    ],
    真空涨跌: (d, d2) => [
        {
            heightPercentage: 0.5,
            layerList: 双价格(d, d2)
        },
        {
            heightPercentage: 0.5,
            layerList: [
                layer(BarLayer, { data: d.期货.真空涨, color: 买颜色 }),
                layer(BarLayer, { data: d.期货.真空跌, color: 卖颜色 }),
                layer(TextLayer, {
                    text: `期货真空涨  ${lastNumber(d.期货.真空涨)} 期货真空跌  ${lastNumber(d.期货.真空跌)} `,
                    color: BTC颜色
                })
            ]
        },
    ],
    BTC_ETH: (d, d2) => [
        {
            heightPercentage: 1,
            和下一张重叠: true,
            layerList: [
                layer(LineLayer, { data: d2.XBTUSD.期货.价格, color: 0xcc66ff })
            ]
        },
        {
            heightPercentage: 1,
            layerList: [
                layer(LineLayer, { data: d2.ETHUSD.期货.价格, color: 0xffff00 })
            ]
        }
    ]
}