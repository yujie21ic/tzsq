import { RealDataBase } from './RealDataServer/RealDataBase'
import { layer, LayerItem } from './lib/Chart'
import { LineLayer } from './lib/Chart/Layer/LineLayer'
import { TextLayer } from './lib/Chart/Layer/TextLayer'
import { lastNumber } from './lib/F/lastNumber'
import { ZeroLayer } from './lib/Chart/Layer/ZeroLayer'
import { 信号Layer } from './lib/Chart/Layer/信号Layer'



type D = RealDataBase['dataExt']['XBTUSD']
type D2 = RealDataBase['dataExt']

type ItemFunc = (d: D, d2: D2) => {
    heightList: number[]
    items: ({
        yCoordinate?: '普通' | '对数'
        layerList: LayerItem[]
    }[] | {
        yCoordinate?: '普通' | '对数'
        layerList: LayerItem[]
    })[]
}


const ETH颜色 = 0xaaaa00
const BTC颜色 = 0xcc66ff
const 买颜色 = 0x0E6655
const 买颜色1 = 0x16A085
const 卖颜色 = 0x943126
const 卖颜色1 = 0xE74C3C
// const 买颜色 = 0x48aa65
// const 卖颜色 = 0xe56546
const 波动率颜色 = 0xC70039
//const 净盘口颜色 = 0xEB95D8
const 石青 = 0x1685a9


export const Tick行情____config: { [key in string]: ItemFunc } = {

    复盘上涨: (d, d2) => ({
        heightList: [0.4, 0.2, 0.2, 0.2], 
        items: [
            [{
                numberColor: BTC颜色,
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
            // {
            //     layerList: [
            //         layer(LineLayer, { data: d2.XBTUSD.hopex.价格, color: ETH颜色 }),
            //     ]
            // },
            // {
            //     layerList: [
            //         layer(ZeroLayer, { color: 0xaaaaaa }),
            //         // layer(LineLayer, { data: d.期货.买MACD.DEM, color: 买颜色 }),
            //         // layer(LineLayer, { data: d.期货.买MACD.DIF, color: 买颜色1 }),
            //         layer(LineLayer, { data: d.期货.净上涨成交量DEM, color: 买颜色 }),
            //         layer(LineLayer, { data: d.期货.净上涨成交量DIF, color: 买颜色1 }),
            //     ]
            // },
            // {
            //     layerList: [
            //         layer(竖线Layer, { data: d.期货.真空信号涨, color: 买颜色 }),

            //     ]
            // },
            // {
            //     layerList: [
            //         layer(ZeroLayer, { color: 0xaaaaaa }),
            //         layer(LineLayer, { data: d.期货.上涨价格DEM, color: 买颜色 }),
            //         layer(LineLayer, { data: d.期货.上涨价格DIF, color: 买颜色1 }),
            //     ]
            // },
            // {
            //     numberColor: 波动率颜色,
            //     numberX: 100,
            //     layerList: [
            //         layer(LineLayer, { data: d.期货.波动率, color: 石青 }),
            //     ]
            // },
            
            // {
            //     layerList: [
            //         layer(LineLayer, { data: d.期货.成交量买均线30, color: ETH颜色 }),
                   
            //     ]
            // },
            {
                layerList: [
                    layer(LineLayer, { data: d.期货.涨价差, color: 波动率颜色 }),
                ]
            },
            {
                layerList: [
                    layer(LineLayer, { data: d.期货.涨价差__除以__这一段内的成交量, color: ETH颜色 }),
                ]
            }
            // {
            //     layerList: [
                   
            //     ]
            // },
        
            // {
            //     layerList: [

            //         layer(LineLayer, { data: d.期货.价格均线60, color: ETH颜色 }),
            //         layer(LineLayer, { data: d.期货.最高价10, color: 波动率颜色 }),
            //     ]
            // },
            // {
            //     layerList: [

            //         layer(LineLayer, { data: d2.ETHUSD.期货.价格, color: ETH颜色 }),
            //     ]
            // },
            // {

            //     layerList: [

            //         layer(LineLayer, { data: d.期货.上涨速度, color: 买颜色 }),
            //     ]
            // }
            ],
            // {
            //     layerList: [

            //         layer(LineLayer, { data: d.期货.成交量均线买1, color: 买颜色 }),
            //     ]
            // },

            {
                layerList: [
                    layer(ZeroLayer, { color: 0xaaaaaa }),
                    layer(LineLayer, { data: d.期货.盘口买, color: 买颜色 }),
                    layer(LineLayer, { data: d.期货.盘口卖, color: 卖颜色, 临时参数: '变成负数' }),
                    layer(LineLayer, { data: d.期货.净盘口, color: BTC颜色 }),
                    layer(LineLayer, { data: d.期货.净盘口均线, color: ETH颜色 }),
                ]
            },
            {
                layerList: [
                    layer(ZeroLayer, { color: 0xaaaaaa }),
                    layer(LineLayer, { data: d.期货.买MACD. 买成交量DEM, color: 买颜色 }),
                    layer(LineLayer, { data: d.期货.买MACD. 买成交量DIF, color: 买颜色1 }),
                    layer(LineLayer, { data: d.期货.卖MACD.卖成交量DEM, color: 卖颜色 }),
                    layer(LineLayer, { data: d.期货.卖MACD.卖成交量DIF, color: 卖颜色1 }),
                ]
            },
            // {
            //     layerList: [
            //         layer(ZeroLayer, { color: 0xaaaaaa }),
            //         layer(LineLayer, { data: d.期货.上涨速度DEM, color: 买颜色 }),
            //         layer(LineLayer, { data: d.期货.上涨速度DIF, color: 卖颜色 }),
            //         // layer(LineLayer, { data: d.期货.下跌速度DEM, color: 卖颜色 }),
            //         // layer(LineLayer, { data: d.期货.下跌速度DIF, color: 卖颜色1 }),
            //     ]
            // },
            {
                layerList: [
                    layer(信号Layer, { data: d.期货.信号_上涨, color: 卖颜色 }),
                ]
            },
        ]
    }),
    复盘下跌: (d, d2) =>({
        heightList: [0.4, 0.2, 0.2, 0.2], 
        items: [
            [{
                numberColor: BTC颜色,
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
            // {
            //     layerList: [
            //         layer(LineLayer, { data: d2.XBTUSD.hopex.价格, color: ETH颜色 }),
            //     ]
            // },
            // {
            //     layerList: [
            //         layer(ZeroLayer, { color: 0xaaaaaa }),
                   
            //         layer(LineLayer, { data: d.期货.净下跌成交量DEM, color: 卖颜色 }),
            //         layer(LineLayer, { data: d.期货.净下跌成交量DIF, color: 卖颜色1 }),
            //     ]
            // },
            // {
            //     layerList: [
            //         layer(竖线Layer, { data: d.期货.真空信号跌, color: 卖颜色 }),

            //     ]
            // },
            // {
            //     layerList: [
            //         layer(ZeroLayer, { color: 0xaaaaaa }),
            //         layer(LineLayer, { data: d.期货.下跌价格DEM, color: 卖颜色 }),
            //         layer(LineLayer, { data: d.期货.下跌价格DIF, color: 卖颜色1 }),
            //     ]
            // },
            {
                numberColor: 波动率颜色,
                numberX: 100,
                layerList: [
                    layer(LineLayer, { data: d.期货.波动率, color: 石青 }),
                    
                ]
            },
            {
                layerList: [
                    layer(LineLayer, { data: d.期货.跌价差, color: 波动率颜色 }),
                ]
            },
            {
                layerList: [
                    layer(LineLayer, { data: d.期货.跌价差__除以__这一段内的成交量, color: ETH颜色 }),
                ]
            },
            // {
            //     layerList: [
            //         layer(LineLayer, { data: d.期货.跌价差__除以__这一段内的成交量, color: ETH颜色 }),
            //     ]
            // },
            // {
            //     layerList: [
            //         layer(LineLayer, { data: d.期货.跌价差, color: 波动率颜色 }),
            //     ]
            // },
            // {
            //     layerList: [
            //         layer(LineLayer, { data: d.期货.跌价差__累计成交量, color: ETH颜色 }),
            //     ]
            // }
        ],
      


        {
            layerList: [
                layer(ZeroLayer, { color: 0xaaaaaa }),
                layer(LineLayer, { data: d.期货.盘口买, color: 买颜色 }),
                layer(LineLayer, { data: d.期货.盘口卖, color: 卖颜色, 临时参数: '变成负数' }),
                layer(LineLayer, { data: d.期货.净盘口, color: BTC颜色 }),
                layer(LineLayer, { data: d.期货.净盘口均线, color: ETH颜色 }),
            ]
        },
        {
            layerList: [
                layer(ZeroLayer, { color: 0xaaaaaa }),
                layer(LineLayer, { data: d.期货.买MACD. 买成交量DEM, color: 买颜色 }),
                    layer(LineLayer, { data: d.期货.买MACD. 买成交量DIF, color: 买颜色1 }),
                layer(LineLayer, { data: d.期货.卖MACD. 卖成交量DEM, color: 卖颜色 }),
                layer(LineLayer, { data: d.期货.卖MACD. 卖成交量DIF, color: 卖颜色1 }),
            ]
        },
        // {
        //     layerList: [
        //         layer(ZeroLayer, { color: 0xaaaaaa }),
        //         // layer(LineLayer, { data: d.期货.上涨速度DEM, color: 买颜色 }),
        //         // layer(LineLayer, { data: d.期货.上涨速度DIF, color: 买颜色1 }),
        //         layer(LineLayer, { data: d.期货.下跌速度DEM, color: 卖颜色 }),
        //         layer(LineLayer, { data: d.期货.下跌速度DIF, color: 买颜色 }),
        //     ]
        // },
        {
            layerList: [
                layer(信号Layer, { data: d.期货.信号_下跌, color: 买颜色 }),
            ]
        },
    ]}),

    实盘: (d, d2) => ({
        heightList:[0.6,0.1,0.1,0.1,0.1],
        items:[
        [{
            numberColor: BTC颜色,
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
            layerList: [
                layer(LineLayer, { data: d2.XBTUSD.hopex.价格, color: ETH颜色 }),
            ]
        },
        {
            numberColor: 石青,
            numberX: 100,
            layerList: [
                layer(LineLayer, { data: d.期货.波动率, color: 石青 }),
            ]
        }],
        {
            layerList: [
                layer(信号Layer, { data: d.期货.信号_上涨, color: 卖颜色 }),
            ]
        },
        {
            layerList: [
                layer(信号Layer, { data: d2.XBTUSD.hopex.信号_上涨, color: 卖颜色 }),
            ]
        },
        {
            layerList: [
                layer(信号Layer, { data: d.期货.信号_下跌, color: 买颜色 }),
            ]
        },
        {
            layerList: [
                layer(信号Layer, { data: d2.XBTUSD.hopex.信号_下跌, color: 买颜色 }),
            ]
        },
    ]}),
    实盘hopex: (d, d2) => ({
        heightList:[0.4,0.15,0.15,0.15,0.15],
        items:[
        [{
            //numberColor: BTC颜色,
            layerList: [
                layer(LineLayer, { data: d2.XBTUSD.期货.价格, color: BTC颜色 }),
                layer(TextLayer, {
                    text:
                        `hopex:${lastNumber(d2.XBTUSD.hopex.价格).toFixed(2)}  ` +
                        `bitmex:${lastNumber(d.期货.价格).toFixed(2)}      ` +
                        `期货30秒内成交量:${d.期货30秒内成交量().toFixed(2)}万   ` +
                        `期货波动率:${lastNumber(d.期货.波动率).toFixed(2)}`,
                    color: ETH颜色,
                })
            ]
        },
        {
            layerList: [
                layer(LineLayer, { data: d2.XBTUSD.hopex.价格, color: ETH颜色 }),
            ]
        },
        {
            numberColor: 石青,
            numberX: 100,
            layerList: [
                layer(LineLayer, { data: d.期货.波动率, color: 石青 }),
            ]
        }
    ],
        {
            layerList: [
                layer(ZeroLayer, { color: 0xaaaaaa }),
                layer(LineLayer, { data: d2.XBTUSD.hopex.盘口买, color: 买颜色 }),
                layer(LineLayer, { data: d2.XBTUSD.hopex.盘口卖, color: 卖颜色, 临时参数: '变成负数' }),
                layer(LineLayer, { data: d2.XBTUSD.hopex.净盘口, color: BTC颜色 }),
                layer(LineLayer, { data: d2.XBTUSD.hopex.净盘口均线, color: ETH颜色 }),
                layer(TextLayer, {
                    text:
                        `hopex盘口 ` ,
                    color:ETH颜色,
                })
            ]
        },
        {
            layerList: [
                layer(ZeroLayer, { color: 0xaaaaaa }),
                layer(LineLayer, { data:d2.XBTUSD.hopex.买MACD. 买成交量DEM, color: 买颜色 }),
                layer(LineLayer, { data:d2.XBTUSD.hopex.买MACD. 买成交量DIF, color: 买颜色1 }),
                layer(LineLayer, { data: d2.XBTUSD.hopex.卖MACD.  卖成交量DEM, color: 卖颜色 }),
                layer(LineLayer, { data: d2.XBTUSD.hopex.卖MACD. 卖成交量DIF, color: 卖颜色1 }),
                layer(TextLayer, {
                    text:
                        `hopex成交量` ,
                    color:ETH颜色,
                })
            ]
        },
        {
            layerList: [
                layer(ZeroLayer, { color: 0xaaaaaa }),
                layer(LineLayer, { data: d.期货.盘口买, color: 买颜色 }),
                layer(LineLayer, { data: d.期货.盘口卖, color: 卖颜色, 临时参数: '变成负数' }),
                layer(LineLayer, { data: d.期货.净盘口, color: BTC颜色 }),
                layer(LineLayer, { data: d.期货.净盘口均线, color: ETH颜色 }),
                layer(TextLayer, {
                    text:
                        `bitmex盘口` ,
                    color:ETH颜色,
                })
            ]
        },
        {
            layerList: [
                layer(ZeroLayer, { color: 0xaaaaaa }),
                layer(LineLayer, { data: d.期货.买MACD.买成交量DEM, color: 买颜色 }),
                layer(LineLayer, { data: d.期货.买MACD.买成交量DIF, color: 买颜色1 }),
                layer(LineLayer, { data: d.期货.卖MACD.卖成交量DEM, color: 卖颜色 }),
                layer(LineLayer, { data: d.期货.卖MACD.卖成交量DIF, color: 卖颜色1 }),
                layer(TextLayer, {
                    text:
                        `bitmex成交量` ,
                    color:ETH颜色,
                })
            ]
        },
    ]}),
    复盘下跌动力: (d, d2) =>({
        heightList: [0.4, 0.2, 0.4], 
        items: [
            [{
                numberColor: BTC颜色,
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
                layerList: [
                    layer(LineLayer, { data: d.期货.跌价差__交叉点价格, color: ETH颜色 }),
                ]
            },
            {
                layerList: [
                    layer(LineLayer, { data: d.期货.跌价差__累计成交量, color: ETH颜色 }),
                ]
            },
           
        ],
        {   
            layerList: [
                layer(LineLayer, { data: d.期货.跌价差2, color: 波动率颜色 }),
            ]
        },
        [
            {
                yCoordinate:"对数",
                layerList: [
                    layer(LineLayer, { data: d.期货.跌价差__除以__这一段内的成交量, color: ETH颜色 }),
                ]
            },
           
        ]
    ]}),
    复盘上涨动力: (d, d2) => ({
        heightList: [0.4, 0.2, 0.4], 
        items: [
            [{
                numberColor: BTC颜色,
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
                layerList: [
                    layer(LineLayer, { data: d.期货.涨价差__交叉点价格, color: 买颜色 }),
                ]
            },
          
            {
                layerList: [
                    layer(LineLayer, { data: d.期货.涨价差__累计成交量, color: ETH颜色 }),
                ]
            },
        
            ],
            {
                layerList: [

                    layer(LineLayer, { data: d.期货.涨价差, color: 波动率颜色 }),
                ]
            },
           
            [

                {   
                    layerList: [
                        layer(LineLayer, { data: d.期货.涨价差__除以__这一段内的成交量, color: ETH颜色 }),
                    ]
                },
             
            ]
          
        ]
    }),
}