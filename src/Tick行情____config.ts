import { RealDataBase } from './RealDataServer/RealDataBase'
import { layer, LayerItem } from './lib/Chart'
import { LineLayer } from './lib/Chart/Layer/LineLayer'
import { TextLayer, LeftTextLayer } from './lib/Chart/Layer/TextLayer'
import { lastNumber } from './lib/F/lastNumber'
import { ZeroLayer } from './lib/Chart/Layer/ZeroLayer'
import { 信号Layer } from './lib/Chart/Layer/信号Layer'
import { KLineLayer } from './lib/Chart/Layer/KLineLayer'
import { 笔Layer } from './lib/Chart/Layer/笔Layer'
import { get笔Index, get线段, 合并后的K线 } from './指标/缠中说禅'
import { 线段Layer } from './lib/Chart/Layer/线段Layer'
import { 合并后的Layer } from './lib/Chart/Layer/合并后的Layer'
import { BarLayer } from './lib/Chart/Layer/BarLayer'



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
const 波动率颜色 = 0x11C70039
const 净成交量颜色 = 0x424242
//const 净盘口颜色 = 0xEB95D8
const 石青 = 0x1685a9


export const Tick行情____config: { [key in string]: ItemFunc } = {

    hopex对赌炒单: (d, d2) => ({
        heightList: [1],
        items: [
            {
                layerList: [
                    layer(LineLayer, { data: d2.ETHUSD.hopex.收盘价, color: 0xffffff }),
                    layer(LineLayer, { data: d2.ETHUSD.hopex.卖.盘口1价, color: 0x00ff00 }),
                    layer(LineLayer, { data: d2.ETHUSD.hopex.买.盘口1价, color: 0xff0000 }),
                ]
            },

        ]
    }),

    实盘手动: (d, d2) => ({
        heightList: [0.2, 0.7, 0.1],
        items: [
            {
                layerList: [
                    layer(ZeroLayer, { color: 0xaaaaaa }),
                    layer(LineLayer, { data: d.bitmex.买.盘口, color: 买颜色 }),
                    layer(LineLayer, { data: d.bitmex.卖.盘口, color: 卖颜色, 临时参数: '变成负数' }),
                    //layer(LineLayer, { data: d.期货.买.净盘口, color: BTC颜色 }),
                    layer(LineLayer, { data: d.bitmex.买.净盘口_均线3, color: ETH颜色 }),
                    layer(TextLayer, {
                        text:
                            `买1  :${(lastNumber(d.bitmex.买.盘口1) / 10000).toFixed(2)}万  ` +
                            `卖1  :${(lastNumber(d.bitmex.卖.盘口1) / 10000).toFixed(2)}万   ` +
                            `期货波动率:${lastNumber(d.bitmex.价格_波动率30).toFixed(2)}`,
                        color: d === d2.XBTUSD ? BTC颜色 : ETH颜色,
                    })
                ]
            },
            [
                {
                    numberColor: 净成交量颜色,
                    numberX: 100,
                    layerList: [
                        layer(ZeroLayer, { color: 净成交量颜色 }),
                        layer(LineLayer, { data: d.bitmex.买.净成交量_累加60, color: 净成交量颜色 }),
                    ]
                },

                // {
                //     numberColor: 石青,
                //     layerList: [
                //         layer(LineLayer, { data: d2.ETHUSD.hopex.价格, color: 石青 }),
                //     ]
                // },
                {
                    numberColor: 波动率颜色,
                    layerList: [
                        layer(LineLayer, { data: d2.XBTUSD.fcoin.价格, color: 波动率颜色 }),
                    ]
                },

                {
                    numberColor: 0x000000,
                    layerList: [
                        layer(LineLayer, { data: d2.XBTUSD.bitmex.价格, color: BTC颜色 }),
                        layer(TextLayer, {
                            text:
                                `买1  :${(lastNumber(d.bitmex.买.盘口1) / 10000).toFixed(2)}万  ` +
                                `卖1  :${(lastNumber(d.bitmex.卖.盘口1) / 10000).toFixed(2)}万   `,
                            color: d === d2.XBTUSD ? BTC颜色 : ETH颜色,
                        }),
                        layer(LeftTextLayer, {
                            text:
                                `hopex:${lastNumber(d2.XBTUSD.hopex.价格).toFixed(2)}  ` +
                                `hopex:${lastNumber(d2.ETHUSD.hopex.价格).toFixed(2)}  ` +
                                `fcoin:${lastNumber(d2.XBTUSD.fcoin.价格).toFixed(2)}  ` +
                                `bitmex:${lastNumber(d.bitmex.价格).toFixed(2)}      ` +
                                `期货30秒内成交量:${d.期货30秒内成交量().toFixed(2)}万   ` +
                                `期货波动率:${lastNumber(d.bitmex.价格_波动率30).toFixed(2)}`,
                            color: d === d2.XBTUSD ? BTC颜色 : ETH颜色,
                        })
                    ]
                },
                {
                    numberColor: BTC颜色,
                    layerList: [
                        layer(LineLayer, { data: d2.XBTUSD.hopex.价格, color: ETH颜色 }),
                    ]
                },


            ],
            {
                layerList: [
                    layer(信号Layer, { data: d2.XBTUSD.bitmex.着笔涨跌, color: 0xaaaaaa }),
                ]
            }
            // [
            //     {
            //         layerList: [
            //             layer(ZeroLayer, { color: 0xaaaaaa }),

            //             layer(LineLayer, { data: d.bitmex.买.成交量, color: 买颜色 }),
            //             layer(LineLayer, { data: d.bitmex.卖.成交量, color: 卖颜色, 临时参数: '变成负数' }),
            //             //layer(LineLayer, { data: d.bitmex.卖.净成交量_累加10, color: ETH颜色 }),
            //             //layer(LineLayer, { data: d.bitmex.买.净成交量_累加10, color: BTC颜色 }),
            //             //layer(LineLayer, { data: d.期货.净成交量均线10, color: ETH颜色 }),
            //             layer(TextLayer, { text: '成交量买 成交量卖      ', color: 0xffff00 })
            //         ]
            //     },
            // ],


            // {
            //     layerList: [
            //         layer(LineLayer, { data: d.期货.买.盘口, color: 买颜色 }),
            //         layer(LineLayer, { data: d.期货.卖.盘口, color: 卖颜色 }),
            //         layer(TextLayer, { text: '盘口买 盘口卖      ', color: 0xffff00 })
            //     ]
            // },

        ]
    }),
    实盘fcoin手动: (d, d2) => ({
        heightList: [0.2, 0.2, 0.5, 0.1],
        items: [
            {
                layerList: [
                    layer(ZeroLayer, { color: 0xaaaaaa }),
                    layer(LineLayer, { data: d.bitmex.买.盘口, color: 买颜色 }),
                    layer(LineLayer, { data: d.bitmex.卖.盘口, color: 卖颜色, 临时参数: '变成负数' }),
                    //layer(LineLayer, { data: d.期货.买.净盘口, color: BTC颜色 }),
                    layer(LineLayer, { data: d.bitmex.买.净盘口_均线3, color: ETH颜色 }),
                    layer(TextLayer, {
                        text:
                            `买1  :${(lastNumber(d.bitmex.买.盘口1) / 10000).toFixed(2)}万  ` +
                            `卖1  :${(lastNumber(d.bitmex.卖.盘口1) / 10000).toFixed(2)}万   ` +
                            `期货波动率:${lastNumber(d.bitmex.价格_波动率30).toFixed(2)}`,
                        color: d === d2.XBTUSD ? BTC颜色 : ETH颜色,
                    })
                ]
            },
            {
                layerList: [
                    layer(ZeroLayer, { color: 0xaaaaaa }),
                    layer(LineLayer, { data: d2.XBTUSD.fcoin.买.盘口, color: 买颜色 }),
                    layer(LineLayer, { data: d2.XBTUSD.fcoin.卖.盘口, color: 卖颜色, 临时参数: '变成负数' }),
                    //layer(LineLayer, { data: d.期货.买.净盘口, color: BTC颜色 }),
                    layer(LineLayer, { data: d2.XBTUSD.fcoin.买.净盘口_均线3, color: ETH颜色 }),
                    layer(TextLayer, {
                        text:
                            `买1  :${(lastNumber(d2.XBTUSD.fcoin.买.盘口1)).toFixed(2)}个  ` +
                            `卖1  :${(lastNumber(d2.XBTUSD.fcoin.卖.盘口1)).toFixed(2)}个   ` +
                            `期货波动率:${lastNumber(d.bitmex.价格_波动率30).toFixed(2)}`,
                        color: d === d2.XBTUSD ? BTC颜色 : ETH颜色,
                    })
                ]
            },
            [
                {
                    numberColor: 净成交量颜色,
                    numberX: 100,
                    layerList: [
                        layer(ZeroLayer, { color: 净成交量颜色 }),
                        layer(LineLayer, { data: d.bitmex.买.净成交量_累加60, color: 净成交量颜色 }),
                    ]
                },

                {
                    numberColor: 石青,
                    layerList: [
                        layer(LineLayer, { data: d2.ETHUSD.hopex.价格, color: 石青 }),
                    ]
                },
                // {
                //     numberColor: 波动率颜色,
                //     layerList: [
                //         layer(LineLayer, { data: d2.XBTUSD.fcoin.价格, color: 波动率颜色 }),
                //     ]
                // },

                {
                    numberColor: 0x000000,
                    layerList: [
                        layer(LineLayer, { data: d2.XBTUSD.bitmex.价格, color: BTC颜色 }),
                        layer(TextLayer, {
                            text:
                                `买1  :${(lastNumber(d.bitmex.买.盘口1) / 10000).toFixed(2)}万  ` +
                                `卖1  :${(lastNumber(d.bitmex.卖.盘口1) / 10000).toFixed(2)}万   `,
                            color: d === d2.XBTUSD ? BTC颜色 : ETH颜色,
                        }),
                        layer(LeftTextLayer, {
                            text:
                                `hopex:${lastNumber(d2.XBTUSD.hopex.价格).toFixed(2)}  ` +
                                `hopex:${lastNumber(d2.ETHUSD.hopex.价格).toFixed(2)}  ` +
                                `fcoin:${lastNumber(d2.XBTUSD.fcoin.价格).toFixed(2)}  ` +
                                `bitmex:${lastNumber(d.bitmex.价格).toFixed(2)}      ` +
                                `期货30秒内成交量:${d.期货30秒内成交量().toFixed(2)}万   ` +
                                `期货波动率:${lastNumber(d.bitmex.价格_波动率30).toFixed(2)}`,
                            color: d === d2.XBTUSD ? BTC颜色 : ETH颜色,
                        })
                    ]
                },
                {
                    numberColor: BTC颜色,
                    layerList: [
                        layer(LineLayer, { data: d2.XBTUSD.hopex.价格, color: ETH颜色 }),
                        layer(LineLayer, { data: d2.XBTUSD.fcoin.价格, color: 波动率颜色 }),
                    ]
                },


            ],
            {
                layerList: [
                    layer(信号Layer, { data: d2.XBTUSD.bitmex.着笔涨跌, color: 0xaaaaaa }),
                ]
            }
            // [
            //     {
            //         layerList: [
            //             layer(ZeroLayer, { color: 0xaaaaaa }),

            //             layer(LineLayer, { data: d.bitmex.买.成交量, color: 买颜色 }),
            //             layer(LineLayer, { data: d.bitmex.卖.成交量, color: 卖颜色, 临时参数: '变成负数' }),
            //             //layer(LineLayer, { data: d.bitmex.卖.净成交量_累加10, color: ETH颜色 }),
            //             //layer(LineLayer, { data: d.bitmex.买.净成交量_累加10, color: BTC颜色 }),
            //             //layer(LineLayer, { data: d.期货.净成交量均线10, color: ETH颜色 }),
            //             layer(TextLayer, { text: '成交量买 成交量卖      ', color: 0xffff00 })
            //         ]
            //     },
            // ],


            // {
            //     layerList: [
            //         layer(LineLayer, { data: d.期货.买.盘口, color: 买颜色 }),
            //         layer(LineLayer, { data: d.期货.卖.盘口, color: 卖颜色 }),
            //         layer(TextLayer, { text: '盘口买 盘口卖      ', color: 0xffff00 })
            //     ]
            // },

        ]
    }),
    实盘fcoin手动成交量: (d, d2) => ({
        heightList: [0.2,0.2, 0.5, 0.1],
        items: [
            {
                layerList: [
                    layer(ZeroLayer, { color: 0xaaaaaa }),
                    layer(LineLayer, { data: d.bitmex.买.盘口, color: 买颜色 }),
                    layer(LineLayer, { data: d.bitmex.卖.盘口, color: 卖颜色, 临时参数: '变成负数' }),
                    //layer(LineLayer, { data: d.期货.买.净盘口, color: BTC颜色 }),
                    layer(LineLayer, { data: d.bitmex.买.净盘口_均线3, color: ETH颜色 }),
                    layer(TextLayer, {
                        text:
                            `买1  :${(lastNumber(d.bitmex.买.盘口1) / 10000).toFixed(2)}万  ` +
                            `卖1  :${(lastNumber(d.bitmex.卖.盘口1) / 10000).toFixed(2)}万   ` +
                            `期货波动率:${lastNumber(d.bitmex.价格_波动率30).toFixed(2)}`,
                        color: d === d2.XBTUSD ? BTC颜色 : ETH颜色,
                    })
                ]
            },
            {
                layerList: [
                    layer(ZeroLayer, { color: 0xaaaaaa }),
                    layer(LineLayer, { data:  d2.XBTUSD.fcoin.买.净成交量_累加60, color: 买颜色 }),
                    layer(LineLayer, { data:  d2.XBTUSD.fcoin.卖.盘口, color: 卖颜色, 临时参数: '变成负数' }),
                    //layer(LineLayer, { data: d.期货.买.净盘口, color: BTC颜色 }),
                    layer(LineLayer, { data:  d2.XBTUSD.fcoin.买.净盘口_均线3, color: ETH颜色 }),
                    layer(TextLayer, {
                        text:
                            `买1  :${(lastNumber( d2.XBTUSD.fcoin.买.盘口1) ).toFixed(2)}个  ` +
                            `卖1  :${(lastNumber( d2.XBTUSD.fcoin.卖.盘口1) ).toFixed(2)}个   ` +
                            `期货波动率:${lastNumber(d.bitmex.价格_波动率30).toFixed(2)}`,
                        color: d === d2.XBTUSD ? BTC颜色 : ETH颜色,
                    })
                ]
            },
            [
                {
                    numberColor: 净成交量颜色,
                    numberX: 100,
                    layerList: [
                        layer(ZeroLayer, { color: 净成交量颜色 }),
                        //layer(LineLayer, { data: d.bitmex.买.净成交量_累加60, color: 净成交量颜色 }),
                        layer(LineLayer, { data:  d2.XBTUSD.fcoin.买.净成交量_累加60, color: 净成交量颜色 }),
                    ]
                },
               
                {
                    numberColor: 石青,
                    layerList: [
                        layer(LineLayer, { data: d2.ETHUSD.hopex.价格, color: 石青 }),
                    ]
                },
                // {
                //     numberColor: 波动率颜色,
                //     layerList: [
                //         layer(LineLayer, { data: d2.XBTUSD.fcoin.价格, color: 波动率颜色 }),
                //     ]
                // },
               
                {
                    numberColor: 0x000000,
                    layerList: [
                        layer(LineLayer, { data: d2.XBTUSD.bitmex.价格, color: BTC颜色 }),
                        layer(TextLayer, {
                            text:
                                `买1  :${(lastNumber(d.bitmex.买.盘口1) / 10000).toFixed(2)}万  ` +
                                `卖1  :${(lastNumber(d.bitmex.卖.盘口1) / 10000).toFixed(2)}万   `,
                            color: d === d2.XBTUSD ? BTC颜色 : ETH颜色,
                        }),
                        layer(LeftTextLayer, {
                            text:
                                `hopex:${lastNumber(d2.XBTUSD.hopex.价格).toFixed(2)}  ` +
                                `hopex:${lastNumber(d2.ETHUSD.hopex.价格).toFixed(2)}  ` +
                                `fcoin:${lastNumber(d2.XBTUSD.fcoin.价格).toFixed(2)}  ` +
                                `bitmex:${lastNumber(d.bitmex.价格).toFixed(2)}      ` +
                                `期货30秒内成交量:${d.期货30秒内成交量().toFixed(2)}万   ` +
                                `期货波动率:${lastNumber(d.bitmex.价格_波动率30).toFixed(2)}`,
                            color: d === d2.XBTUSD ? BTC颜色 : ETH颜色,
                        })
                    ]
                },
                {
                    numberColor: BTC颜色,
                    layerList: [
                        layer(LineLayer, { data: d2.XBTUSD.hopex.价格, color: ETH颜色 }),
                        layer(LineLayer, { data: d2.XBTUSD.fcoin.价格, color: 波动率颜色 }),
                    ]
                },


            ],
            {
                layerList: [
                    layer(信号Layer, { data: d2.XBTUSD.bitmex.着笔涨跌, color: 0xaaaaaa }),
                ]
            }
            // [
            //     {
            //         layerList: [
            //             layer(ZeroLayer, { color: 0xaaaaaa }),

            //             layer(LineLayer, { data: d.bitmex.买.成交量, color: 买颜色 }),
            //             layer(LineLayer, { data: d.bitmex.卖.成交量, color: 卖颜色, 临时参数: '变成负数' }),
            //             //layer(LineLayer, { data: d.bitmex.卖.净成交量_累加10, color: ETH颜色 }),
            //             //layer(LineLayer, { data: d.bitmex.买.净成交量_累加10, color: BTC颜色 }),
            //             //layer(LineLayer, { data: d.期货.净成交量均线10, color: ETH颜色 }),
            //             layer(TextLayer, { text: '成交量买 成交量卖      ', color: 0xffff00 })
            //         ]
            //     },
            // ],


            // {
            //     layerList: [
            //         layer(LineLayer, { data: d.期货.买.盘口, color: 买颜色 }),
            //         layer(LineLayer, { data: d.期货.卖.盘口, color: 卖颜色 }),
            //         layer(TextLayer, { text: '盘口买 盘口卖      ', color: 0xffff00 })
            //     ]
            // },

        ]
    }),
    实盘macd: (d, d2) => ({
        heightList: [0.3, 0.3, 0.4],
        items: [
            {
                layerList: [
                    layer(ZeroLayer, { color: ETH颜色 }),
                    layer(LineLayer, { data: d.hopex._12s_macd.DIF, color: 买颜色1 }),
                    layer(LineLayer, { data: d.hopex._12s_macd.DEM, color: 买颜色 }),
                    layer(BarLayer, { data: d.hopex._12s_macd.OSC, color: ETH颜色 }),
                ]
            },
            {
                layerList: [
                    layer(ZeroLayer, { color: ETH颜色 }),
                    layer(LineLayer, { data: d.hopex._60s_macd.DIF, color: 买颜色1 }),
                    layer(LineLayer, { data: d.hopex._60s_macd.DEM, color: 买颜色 }),
                    layer(BarLayer, { data: d.hopex._60s_macd.OSC, color: ETH颜色 }),
                ]
            },
            [

                {
                    numberColor: '0x000000',
                    layerList: [
                        layer(LineLayer, { data: d2.XBTUSD.hopex.价格, color: ETH颜色 }),
                    ]
                },
                {
                    numberColor: 石青,
                    layerList: [
                        layer(LineLayer, { data: d2.ETHUSD.hopex.价格, color: 石青 }),
                    ]
                },
                {
                    numberColor: 净成交量颜色,
                    numberX: 100,
                    layerList: [
                        layer(ZeroLayer, { color: 净成交量颜色 }),
                        layer(LineLayer, { data: d.bitmex.买.净成交量_累加60, color: 净成交量颜色 }),
                    ]
                },
                {
                    numberColor: BTC颜色,
                    layerList: [
                        layer(LineLayer, { data: d2.XBTUSD.bitmex.价格, color: BTC颜色 }),
                        layer(TextLayer, {
                            text:
                                `买1  :${(lastNumber(d.bitmex.买.盘口1) / 10000).toFixed(2)}万  ` +
                                `卖1  :${(lastNumber(d.bitmex.卖.盘口1) / 10000).toFixed(2)}万   `,
                            color: d === d2.XBTUSD ? BTC颜色 : ETH颜色,
                        }),
                        layer(LeftTextLayer, {
                            text:
                                `hopex:${lastNumber(d2.XBTUSD.hopex.价格).toFixed(2)}  ` +
                                `hopex:${lastNumber(d2.ETHUSD.hopex.价格).toFixed(2)}  ` +
                                `bitmex:${lastNumber(d.bitmex.价格).toFixed(2)}      ` +
                                `期货30秒内成交量:${d.期货30秒内成交量().toFixed(2)}万   ` +
                                `期货波动率:${lastNumber(d.bitmex.价格_波动率30).toFixed(2)}`,
                            color: d === d2.XBTUSD ? BTC颜色 : ETH颜色,
                        })
                    ]
                },
            ],
        ]
    }),
    实盘动力手动: (d, d2) => ({
        heightList: [0.3, 0.7],
        items: [
            {
                layerList: [
                    layer(ZeroLayer, { color: 0xaaaaaa }),
                    layer(LineLayer, { data: d.bitmex.买.盘口, color: 买颜色 }),
                    layer(LineLayer, { data: d.bitmex.卖.盘口, color: 卖颜色, 临时参数: '变成负数' }),
                    //layer(LineLayer, { data: d.期货.买.净盘口, color: BTC颜色 }),
                    layer(LineLayer, { data: d.bitmex.买.净盘口_均线3, color: ETH颜色 }),
                    layer(TextLayer, {
                        text:
                            `买1  :${(lastNumber(d.bitmex.买.盘口1) / 10000).toFixed(2)}万  ` +
                            `卖1  :${(lastNumber(d.bitmex.卖.盘口1) / 10000).toFixed(2)}万   ` +
                            `期货波动率:${lastNumber(d.bitmex.价格_波动率30).toFixed(2)}`,
                        color: d === d2.XBTUSD ? BTC颜色 : ETH颜色,
                    })
                ]
            },
            [

                {
                    numberColor: '0x000000',
                    layerList: [
                        layer(LineLayer, { data: d2.XBTUSD.hopex.价格, color: ETH颜色 }),
                    ]
                },
                {
                    numberColor: 石青,
                    numberX: 100,
                    layerList: [
                        layer(ZeroLayer, { color: 石青 }),
                        layer(LineLayer, { data: d.bitmex.阻力3涨, color: 买颜色 }),
                        layer(LineLayer, { data: d.bitmex.阻力3跌, color: 卖颜色 }),
                    ]
                },
                {
                    numberColor: BTC颜色,
                    layerList: [
                        layer(LineLayer, { data: d2.XBTUSD.bitmex.价格, color: BTC颜色 }),
                        layer(TextLayer, {
                            text:
                                `hopex:${lastNumber(d2.XBTUSD.hopex.价格).toFixed(2)}  ` +
                                `bitmex:${lastNumber(d.bitmex.价格).toFixed(2)}      ` +
                                `期货30秒内成交量:${d.期货30秒内成交量().toFixed(2)}万   ` +
                                `买1  :${(lastNumber(d.bitmex.买.盘口1) / 10000).toFixed(2)}万  ` +
                                `卖1  :${(lastNumber(d.bitmex.卖.盘口1) / 10000).toFixed(2)}万   ` +
                                `期货波动率:${lastNumber(d.bitmex.价格_波动率30).toFixed(2)}`,
                            color: d === d2.XBTUSD ? BTC颜色 : ETH颜色,
                        })
                    ]
                },


            ],
            // [
            //     {
            //         layerList: [
            //             layer(ZeroLayer, { color: 0xaaaaaa }),

            //             layer(LineLayer, { data: d.bitmex.买.成交量, color: 买颜色 }),
            //             layer(LineLayer, { data: d.bitmex.卖.成交量, color: 卖颜色, 临时参数: '变成负数' }),
            //             //layer(LineLayer, { data: d.bitmex.卖.净成交量_累加10, color: ETH颜色 }),
            //             //layer(LineLayer, { data: d.bitmex.买.净成交量_累加10, color: BTC颜色 }),
            //             //layer(LineLayer, { data: d.期货.净成交量均线10, color: ETH颜色 }),
            //             layer(TextLayer, { text: '成交量买 成交量卖      ', color: 0xffff00 })
            //         ]
            //     },
            // ],


            // {
            //     layerList: [
            //         layer(LineLayer, { data: d.期货.买.盘口, color: 买颜色 }),
            //         layer(LineLayer, { data: d.期货.卖.盘口, color: 卖颜色 }),
            //         layer(TextLayer, { text: '盘口买 盘口卖      ', color: 0xffff00 })
            //     ]
            // },

        ]
    }),

    实盘相对价差: (d, d2) => ({
        heightList: [0.3, 0.7],
        items: [
            {

                numberColor: 波动率颜色,
                numberX: 100,
                layerList: [
                    layer(ZeroLayer, { color: 石青 }),
                    layer(LineLayer, { data: d.hopex_bitmex_相对差价, color: 买颜色 }),
                    //layer(LineLayer, { data: d.hopex_bitmex_相对差价均线, color: 卖颜色 }),
                ]
            },
            [
                {
                    numberColor: '0x000000',
                    layerList: [
                        layer(LineLayer, { data: d2.XBTUSD.hopex.价格, color: ETH颜色 }),
                    ]
                },
                {
                    numberColor: 波动率颜色,
                    numberX: 100,
                    layerList: [
                        layer(ZeroLayer, { color: 波动率颜色 }),
                        layer(LineLayer, { data: d.bitmex.买.净成交量_累加60, color: 波动率颜色 }),
                    ]
                },
                // {
                //     numberColor: 石青,
                //     numberX: 100,
                //     layerList: [
                //         //layer(ZeroLayer, { color: 石青 }),
                //         layer(LineLayer, { data: d.bitmex.着笔.涨跌, color: 石青 }),
                //     ]
                // },

                {
                    numberColor: BTC颜色,
                    layerList: [
                        layer(LineLayer, { data: d2.XBTUSD.bitmex.价格, color: BTC颜色 }),
                        layer(TextLayer, {
                            text:
                                `hopex:${lastNumber(d2.XBTUSD.hopex.价格).toFixed(2)}  ` +
                                `bitmex:${lastNumber(d.bitmex.价格).toFixed(2)}      ` +
                                `期货30秒内成交量:${d.期货30秒内成交量().toFixed(2)}万   ` +
                                `买1  :${(lastNumber(d.bitmex.买.盘口1) / 10000).toFixed(2)}万  ` +
                                `卖1  :${(lastNumber(d.bitmex.卖.盘口1) / 10000).toFixed(2)}万   ` +
                                `期货波动率:${lastNumber(d.bitmex.价格_波动率30).toFixed(2)}`,
                            color: d === d2.XBTUSD ? BTC颜色 : ETH颜色,
                        })
                    ]
                },
                // {
                //     numberColor: 石青,
                //     numberX: 100,
                //     layerList: [
                //         layer(ZeroLayer, { color: 波动率颜色 }),

                //     ]
                // },
            ],

            // {
            //     layerList: [
            //         layer(ZeroLayer, { color: 0xaaaaaa }),
            //         layer(LineLayer, { data: d.bitmex.卖.成交量_累加60, color: 卖颜色, 临时参数: '变成负数' }),
            //         layer(LineLayer, { data: d.bitmex.买.成交量_累加60, color: 买颜色 }),
            //         //layer(LineLayer, { data: d.bitmex.买.净成交量_累加60, color: 石青 }),
            //         layer(TextLayer, { text: '成交量买 成交量卖      ', color: 0xffff00 })
            //     ]
            // },
            // {
            //     layerList: [
            //         layer(ZeroLayer, { color: 0xaaaaaa }),
            //         layer(LineLayer, { data: d.bitmex.买.盘口, color: 买颜色 }),
            //         layer(LineLayer, { data: d.bitmex.卖.盘口, color: 卖颜色, 临时参数: '变成负数' }),
            //         //layer(LineLayer, { data: d.期货.买.净盘口, color: BTC颜色 }),
            //         layer(LineLayer, { data: d.bitmex.买.净盘口_均线3, color: ETH颜色 }),
            //         layer(TextLayer, {
            //             text:
            //                 `买1  :${(lastNumber(d.bitmex.买.盘口1) / 10000).toFixed(2)}万  ` +
            //                 `卖1  :${(lastNumber(d.bitmex.卖.盘口1) / 10000).toFixed(2)}万   ` +
            //                 `期货波动率:${lastNumber(d.bitmex.价格_波动率30).toFixed(2)}`,
            //             color: d === d2.XBTUSD ? BTC颜色 : ETH颜色,
            //         })
            //     ]
            // },
        ]
    }),

    // 复盘上涨: (d, d2) => ({
    //     heightList: [0.4, 0.15, 0.15, 0.2, 0.1],
    //     items: [
    //         [
    //             {
    //                 layerList: [
    //                     layer(LineLayer, { data: d2.XBTUSD.hopex.价格, color: ETH颜色 }),
    //                 ]
    //             },
    //             // {

    //             {

    //                 numberColor: 波动率颜色,
    //                 numberX: 100,
    //                 layerList: [
    //                     layer(ZeroLayer, { color: 波动率颜色 }),
    //                     layer(LineLayer, { data: d.bitmex.买.净成交量_累加60, color: 波动率颜色 }),
    //                 ]
    //             },
    //             {
    //                 numberColor: 石青,
    //                 numberX: 100,
    //                 layerList: [
    //                     layer(LineLayer, { data: d.bitmex.价格_波动率30, color: 石青 }),
    //                 ]
    //             },
    //             {
    //                 numberColor: BTC颜色,
    //                 layerList: [
    //                     layer(LineLayer, { data: d2.XBTUSD.bitmex.价格, color: BTC颜色 }),

    //                     layer(TextLayer, {
    //                         text:
    //                             `hopex:${lastNumber(d2.XBTUSD.hopex.价格).toFixed(2)}  ` +
    //                             `bitmex:${lastNumber(d.bitmex.价格).toFixed(2)}      ` +
    //                             `期货30秒内成交量:${d.期货30秒内成交量().toFixed(2)}万   ` +
    //                             `买1  :${(lastNumber(d.bitmex.买.盘口1) / 10000).toFixed(2)}万  ` +
    //                             `卖1  :${(lastNumber(d.bitmex.卖.盘口1) / 10000).toFixed(2)}万   ` +
    //                             `期货波动率:${lastNumber(d.bitmex.价格_波动率30).toFixed(2)}`,
    //                         color: d === d2.XBTUSD ? BTC颜色 : ETH颜色,
    //                     })

    //                 ]
    //             },
    //         ],

    //         {
    //             layerList: [
    //                 layer(ZeroLayer, { color: 0xaaaaaa }),
    //                 layer(LineLayer, { data: d.bitmex.买.盘口, color: 买颜色 }),
    //                 layer(LineLayer, { data: d.bitmex.卖.盘口, color: 卖颜色, 临时参数: '变成负数' }),
    //                 layer(LineLayer, { data: d.bitmex.买.净盘口, color: BTC颜色 }),
    //                 layer(LineLayer, { data: d.bitmex.买.净盘口_均线3, color: ETH颜色 }),
    //             ]
    //         },
    //         {
    //             layerList: [
    //                 layer(ZeroLayer, { color: 0xaaaaaa }),
    //                 layer(LineLayer, { data: d.bitmex.净成交量abs_macd.DIF, color: 买颜色1 }),
    //                 layer(LineLayer, { data: d.bitmex.净成交量abs_macd.DEM, color: 买颜色 }),
    //             ]
    //         },
    //         {
    //             layerList: [
    //                 layer(信号Layer, { data: d.bitmex.信号_摸顶, color: 卖颜色 }),
    //                 layer(TextLayer, {
    //                     text:
    //                         `上涨摸顶                    `,
    //                     color: ETH颜色,
    //                 })
    //             ]
    //         },
    //         {
    //             layerList: [
    //                 layer(信号Layer, { data: d.bitmex_信号_摸顶_下跌平仓, color: 卖颜色 }),
    //                 layer(TextLayer, {
    //                     text:
    //                         `信号_摸顶_下跌平仓新                    `,
    //                     color: ETH颜色,
    //                 })
    //             ]
    //         },
    //     ]
    // }),
    // 复盘hopex上涨: (d, d2) => ({
    //     heightList: [0.4, 0.15, 0.15, 0.2, 0.1],
    //     items: [
    //         [

    //             // {

    //             {

    //                 numberColor: 波动率颜色,
    //                 numberX: 100,
    //                 layerList: [
    //                     layer(ZeroLayer, { color: 波动率颜色 }),
    //                     layer(LineLayer, { data: d.bitmex.买.净成交量_累加60, color: 波动率颜色 }),
    //                 ]
    //             },
    //             {
    //                 numberColor: 石青,
    //                 numberX: 100,
    //                 layerList: [
    //                     layer(LineLayer, { data: d.bitmex.价格_波动率30, color: 石青 }),
    //                 ]
    //             },
    //             {
    //                 numberColor: BTC颜色,
    //                 layerList: [
    //                     layer(LineLayer, { data: d2.XBTUSD.bitmex.价格, color: BTC颜色 }),
    //                     layer(TextLayer, {
    //                         text:
    //                             `hopex:${lastNumber(d2.XBTUSD.hopex.价格).toFixed(2)}  ` +
    //                             `bitmex:${lastNumber(d.bitmex.价格).toFixed(2)}      ` +
    //                             `期货30秒内成交量:${d.期货30秒内成交量().toFixed(2)}万   ` +
    //                             `买1  :${(lastNumber(d.bitmex.买.盘口1) / 10000).toFixed(2)}万  ` +
    //                             `卖1  :${(lastNumber(d.bitmex.卖.盘口1) / 10000).toFixed(2)}万   ` +
    //                             `期货波动率:${lastNumber(d.bitmex.价格_波动率30).toFixed(2)}`,
    //                         color: d === d2.XBTUSD ? BTC颜色 : ETH颜色,
    //                     })
    //                 ]
    //             },
    //             {
    //                 layerList: [
    //                     layer(LineLayer, { data: d2.XBTUSD.hopex.价格, color: ETH颜色 }),
    //                 ]
    //             },
    //         ],

    //         {
    //             layerList: [
    //                 layer(ZeroLayer, { color: 0xaaaaaa }),
    //                 layer(LineLayer, { data: d.bitmex.买.盘口, color: 买颜色 }),
    //                 layer(LineLayer, { data: d.bitmex.卖.盘口, color: 卖颜色, 临时参数: '变成负数' }),
    //                 layer(LineLayer, { data: d.bitmex.买.净盘口, color: BTC颜色 }),
    //                 layer(LineLayer, { data: d.bitmex.买.净盘口_均线3, color: ETH颜色 }),
    //             ]
    //         },
    //         {
    //             layerList: [
    //                 layer(信号Layer, { data: d2.XBTUSD.hopex_信号_摸顶, color: 卖颜色 }),
    //                 layer(TextLayer, {
    //                     text:
    //                         `hopex_信号_摸顶                    `,
    //                     color: ETH颜色,
    //                 })
    //             ]
    //         },
    //         {
    //             layerList: [
    //                 layer(信号Layer, { data: d.bitmex.信号_摸顶hopex专用, color: 卖颜色 }),
    //                 layer(TextLayer, {
    //                     text:
    //                         `上涨摸顶                    `,
    //                     color: ETH颜色,
    //                 })
    //             ]
    //         },
    //         {
    //             layerList: [
    //                 layer(信号Layer, { data: d.hopex_信号_摸顶_下跌平仓, color: 卖颜色 }),
    //                 layer(TextLayer, {
    //                     text:
    //                         `信号_摸顶_下跌平仓新                    `,
    //                     color: ETH颜色,
    //                 })
    //             ]
    //         },
    //     ]
    // }),

    // 复盘追涨追跌: (d, d2) => ({
    //     heightList: [0.5, 0.5],
    //     items: [
    //         [
    //             {
    //                 layerList: [
    //                     layer(LineLayer, { data: d2.XBTUSD.hopex.价格, color: ETH颜色 }),
    //                 ]
    //             },
    //             {
    //                 numberColor: 'ETH颜色',
    //                 layerList: [
    //                     layer(ZeroLayer, { color: ETH颜色 }),
    //                     layer(LineLayer, { data: d.bitmex.阻力3涨, color: 买颜色 }),
    //                     layer(LineLayer, { data: d.bitmex.阻力3跌, color: 卖颜色 }),
    //                 ]
    //             },
    //             {
    //                 numberColor: BTC颜色,
    //                 layerList: [
    //                     layer(LineLayer, { data: d2.XBTUSD.bitmex.价格, color: BTC颜色 }),
    //                     layer(TextLayer, {
    //                         text:
    //                             `hopex:${lastNumber(d2.XBTUSD.hopex.价格).toFixed(2)}  ` +
    //                             `bitmex:${lastNumber(d.bitmex.价格).toFixed(2)}      ` +
    //                             `期货30秒内成交量:${d.期货30秒内成交量().toFixed(2)}万   ` +
    //                             `买1  :${(lastNumber(d.bitmex.买.盘口1) / 10000).toFixed(2)}万  ` +
    //                             `卖1  :${(lastNumber(d.bitmex.卖.盘口1) / 10000).toFixed(2)}万   ` +
    //                             `期货波动率:${lastNumber(d.bitmex.价格_波动率30).toFixed(2)}`,
    //                         color: d === d2.XBTUSD ? BTC颜色 : ETH颜色,
    //                     })

    //                 ]
    //             },
    //         ],
    //          {

    //                 numberColor: 波动率颜色,
    //                 numberX: 100,
    //                 layerList: [
    //                     layer(ZeroLayer, { color: 石青 }),
    //                     layer(LineLayer, { data: d.bitmex_hopex_上涨相对差价均线, color: 买颜色 }),
    //                     layer(LineLayer, { data: d.bitmex_hopex_下跌相对价差均线, color: 卖颜色 }),
    //                 ]
    //             },
    //         // {
    //         //     layerList: [
    //         //         layer(信号Layer, { data: d.提醒, color: 买颜色 }),
    //         //         layer(TextLayer, {
    //         //             text:
    //         //                 `提醒                   `,
    //         //             color: ETH颜色,
    //         //         })
    //         //     ]
    //         // },
    //     ]
    // }),
    // 复盘下跌走平追涨: (d, d2) => ({
    //     heightList: [0.5, 0.2, 0.2, 0.1],
    //     items: [
    //         [
    //             {
    //                 layerList: [
    //                     layer(LineLayer, { data: d2.XBTUSD.hopex.价格, color: ETH颜色 }),
    //                 ]
    //             },
    //             // {

    //             //     numberColor: 波动率颜色,
    //             //     numberX: 100,
    //             //     layerList: [
    //             //         layer(ZeroLayer, { color: 波动率颜色 }),
    //             //         layer(LineLayer, { data: d.hopex_价格_macd.DIF, color: 卖颜色1 }),
    //             //         layer(LineLayer, { data: d.hopex_价格_macd.DEM, color: 卖颜色 }),
    //             //     ]
    //             // },
    //             {
    //                 numberColor: 石青,
    //                 numberX: 100,
    //                 layerList: [
    //                     layer(ZeroLayer, { color: 石青 }),
    //                     layer(LineLayer, { data: d.bitmex_hopex_下跌相对价差均线, color: 石青 }),
    //                     layer(LineLayer, { data: d.bitmex_hopex_下跌相对价差, color: 买颜色 }),
    //                 ]
    //             },
    //             {
    //                 numberColor: BTC颜色,
    //                 layerList: [
    //                     layer(LineLayer, { data: d2.XBTUSD.bitmex.价格, color: BTC颜色 }),
    //                     layer(TextLayer, {
    //                         text:
    //                             `hopex:${lastNumber(d2.XBTUSD.hopex.价格).toFixed(2)}  ` +
    //                             `bitmex:${lastNumber(d.bitmex.价格).toFixed(2)}      ` +
    //                             `期货30秒内成交量:${d.期货30秒内成交量().toFixed(2)}万   ` +
    //                             `买1  :${(lastNumber(d.bitmex.买.盘口1) / 10000).toFixed(2)}万  ` +
    //                             `卖1  :${(lastNumber(d.bitmex.卖.盘口1) / 10000).toFixed(2)}万   ` +
    //                             `期货波动率:${lastNumber(d.bitmex.价格_波动率30).toFixed(2)}`,
    //                         color: d === d2.XBTUSD ? BTC颜色 : ETH颜色,
    //                     })

    //                 ]
    //             },

    //         ],

    //         {
    //             layerList: [
    //                 layer(ZeroLayer, { color: 0xaaaaaa }),
    //                 layer(LineLayer, { data: d.bitmex.买.盘口, color: 买颜色 }),
    //                 layer(LineLayer, { data: d.bitmex.卖.盘口, color: 卖颜色, 临时参数: '变成负数' }),
    //                 layer(LineLayer, { data: d.bitmex.买.净盘口, color: BTC颜色 }),
    //                 layer(LineLayer, { data: d.bitmex.买.净盘口_均线3, color: ETH颜色 }),
    //             ]
    //         },
    //         {
    //             numberColor: 石青,
    //             numberX: 100,
    //             layerList: [
    //                 layer(ZeroLayer, { color: 波动率颜色 }),
    //                 layer(LineLayer, { data: d.bitmex.bitmex_价格_macd.DIF, color: 卖颜色1 }),
    //                 layer(LineLayer, { data: d.bitmex.bitmex_价格_macd.DEM, color: 卖颜色 }),
    //             ]
    //         },
    //         {
    //             layerList: [
    //                 layer(信号Layer, { data: d.bitmex_信号_追涨, color: 买颜色 }),
    //                 layer(TextLayer, {
    //                     text:
    //                         `信号_追涨                   `,
    //                     color: ETH颜色,
    //                 })
    //             ]
    //         },
    //     ]
    // }),
    // 复盘上涨走平追跌: (d, d2) => ({
    //     heightList: [0.5, 0.2, 0.2, 0.1],
    //     items: [
    //         [
    //             {
    //                 layerList: [
    //                     layer(LineLayer, { data: d2.XBTUSD.hopex.价格, color: ETH颜色 }),
    //                 ]
    //             },
    //             // {

    //             //     numberColor: 波动率颜色,
    //             //     numberX: 100,
    //             //     layerList: [
    //             //         layer(ZeroLayer, { color: 波动率颜色 }),
    //             //         layer(LineLayer, { data: d.hopex_价格_macd.DIF, color: 卖颜色1 }),
    //             //         layer(LineLayer, { data: d.hopex_价格_macd.DEM, color: 卖颜色 }),
    //             //     ]
    //             // },
    //             {
    //                 numberColor: 石青,
    //                 numberX: 100,
    //                 layerList: [
    //                     layer(ZeroLayer, { color: 石青 }),
    //                     layer(LineLayer, { data: d.bitmex_hopex_上涨相对差价均线, color: 石青 }),
    //                     layer(LineLayer, { data: d.bitmex_hopex_上涨相对价差, color: 买颜色 }),
    //                 ]
    //             },
    //             {
    //                 numberColor: BTC颜色,
    //                 layerList: [
    //                     layer(LineLayer, { data: d2.XBTUSD.bitmex.价格, color: BTC颜色 }),

    //                     layer(TextLayer, {
    //                         text:
    //                             `hopex:${lastNumber(d2.XBTUSD.hopex.价格).toFixed(2)}  ` +
    //                             `bitmex:${lastNumber(d.bitmex.价格).toFixed(2)}      ` +
    //                             `期货30秒内成交量:${d.期货30秒内成交量().toFixed(2)}万   ` +
    //                             `买1  :${(lastNumber(d.bitmex.买.盘口1) / 10000).toFixed(2)}万  ` +
    //                             `卖1  :${(lastNumber(d.bitmex.卖.盘口1) / 10000).toFixed(2)}万   ` +
    //                             `期货波动率:${lastNumber(d.bitmex.价格_波动率30).toFixed(2)}`,
    //                         color: d === d2.XBTUSD ? BTC颜色 : ETH颜色,
    //                     })
    //                 ]
    //             },

    //         ],

    //         {
    //             numberColor: 石青,
    //             numberX: 100,
    //             layerList: [
    //                 layer(ZeroLayer, { color: 波动率颜色 }),
    //                 layer(LineLayer, { data: d.bitmex.bitmex_价格_macd.DIF, color: 卖颜色1 }),
    //                 layer(LineLayer, { data: d.bitmex.bitmex_价格_macd.DEM, color: 卖颜色 }),
    //             ]
    //         },
    //         {
    //             numberColor: 石青,
    //             numberX: 100,
    //             layerList: [
    //                 layer(ZeroLayer, { color: 石青 }),
    //                 layer(LineLayer, { data: d.bitmex_hopex_上涨相对差价均线, color: 买颜色 }),
    //                 //layer(LineLayer, { data: d.bitmex_hopex_下跌相对价差均线, color: 卖颜色 }),
    //             ]
    //         },
    //         {
    //             layerList: [
    //                 layer(信号Layer, { data: d.bitmex_信号_追跌, color: 卖颜色 }),
    //                 layer(TextLayer, {
    //                     text:
    //                         `信号_追跌                    `,
    //                     color: ETH颜色,
    //                 })
    //             ]
    //         },
    //     ]
    // }),
    // 复盘下跌: (d, d2) => ({
    //     heightList: [0.4, 0.15, 0.15, 0.2, 0.1],
    //     items: [
    //         [
    //             {
    //                 layerList: [
    //                     layer(LineLayer, { data: d2.XBTUSD.hopex.价格, color: ETH颜色 }),
    //                 ]
    //             },
    //             {
    //                 numberColor: 波动率颜色,
    //                 numberX: 100,
    //                 layerList: [
    //                     layer(ZeroLayer, { color: 波动率颜色 }),
    //                     layer(LineLayer, { data: d.bitmex.买.净成交量_累加60, color: 波动率颜色 }),
    //                 ]
    //             },
    //             {
    //                 numberColor: 石青,
    //                 numberX: 100,
    //                 layerList: [
    //                     layer(LineLayer, { data: d.bitmex.价格_波动率30, color: 石青 }),

    //                 ]
    //             },
    //             {
    //                 numberColor: BTC颜色,
    //                 layerList: [
    //                     layer(LineLayer, { data: d2.XBTUSD.bitmex.价格, color: BTC颜色 }),
    //                     layer(TextLayer, {
    //                         text:
    //                             `hopex:${lastNumber(d2.XBTUSD.hopex.价格).toFixed(2)}  ` +
    //                             `bitmex:${lastNumber(d.bitmex.价格).toFixed(2)}      ` +
    //                             `期货30秒内成交量:${d.期货30秒内成交量().toFixed(2)}万   ` +
    //                             `买1  :${(lastNumber(d.bitmex.买.盘口1) / 10000).toFixed(2)}万  ` +
    //                             `卖1  :${(lastNumber(d.bitmex.卖.盘口1) / 10000).toFixed(2)}万   ` +
    //                             `期货波动率:${lastNumber(d.bitmex.价格_波动率30).toFixed(2)}`,
    //                         color: d === d2.XBTUSD ? BTC颜色 : ETH颜色,
    //                     })
    //                 ]
    //             },
    //         ],



    //         {
    //             layerList: [
    //                 layer(ZeroLayer, { color: 0xaaaaaa }),
    //                 layer(LineLayer, { data: d.bitmex.买.盘口, color: 买颜色 }),
    //                 layer(LineLayer, { data: d.bitmex.卖.盘口, color: 卖颜色, 临时参数: '变成负数' }),
    //                 layer(LineLayer, { data: d.bitmex.买.净盘口, color: BTC颜色 }),
    //                 layer(LineLayer, { data: d.bitmex.买.净盘口_均线3, color: ETH颜色 }),
    //             ]
    //         },
    //         {
    //             layerList: [
    //                 layer(ZeroLayer, { color: 0xaaaaaa }),
    //                 layer(LineLayer, { data: d.bitmex.净成交量abs_macd.DIF, color: 卖颜色1 }),
    //                 layer(LineLayer, { data: d.bitmex.净成交量abs_macd.DEM, color: 卖颜色 }),
    //             ]
    //         },
    //         {
    //             layerList: [
    //                 layer(信号Layer, { data: d.bitmex.信号_抄底, color: 买颜色 }),
    //                 layer(TextLayer, {
    //                     text:
    //                         `下跌抄底                    `,
    //                     color: ETH颜色,
    //                 })
    //             ]
    //         },
    //         {
    //             layerList: [
    //                 layer(信号Layer, { data: d.bitmex_信号_抄底_上涨平仓, color: 买颜色 }),
    //                 layer(TextLayer, {
    //                     text:
    //                         `信号_抄底_上涨平仓新                    `,
    //                     color: ETH颜色,
    //                 })
    //             ]
    //         },

    //     ]
    // }),
    复盘hopex下跌: (d, d2) => ({
        heightList: [0.4, 0.15, 0.15, 0.2, 0.1],
        items: [
            [

                {
                    numberColor: 波动率颜色,
                    numberX: 100,
                    layerList: [
                        layer(ZeroLayer, { color: 波动率颜色 }),
                        layer(LineLayer, { data: d.bitmex.买.净成交量_累加60, color: 波动率颜色 }),
                    ]
                },
                {
                    numberColor: 石青,
                    numberX: 100,
                    layerList: [
                        layer(LineLayer, { data: d.bitmex.价格_波动率30, color: 石青 }),

                    ]
                },
                {
                    numberColor: BTC颜色,
                    layerList: [
                        layer(LineLayer, { data: d2.XBTUSD.bitmex.价格, color: BTC颜色 }),
                        layer(TextLayer, {
                            text:
                                `hopex:${lastNumber(d2.XBTUSD.hopex.价格).toFixed(2)}  ` +
                                `bitmex:${lastNumber(d.bitmex.价格).toFixed(2)}      ` +
                                `期货30秒内成交量:${d.期货30秒内成交量().toFixed(2)}万   ` +
                                `买1  :${(lastNumber(d.bitmex.买.盘口1) / 10000).toFixed(2)}万  ` +
                                `卖1  :${(lastNumber(d.bitmex.卖.盘口1) / 10000).toFixed(2)}万   ` +
                                `期货波动率:${lastNumber(d.bitmex.价格_波动率30).toFixed(2)}`,
                            color: d === d2.XBTUSD ? BTC颜色 : ETH颜色,
                        })
                    ]
                },
                {
                    layerList: [
                        layer(LineLayer, { data: d2.XBTUSD.hopex.价格, color: ETH颜色 }),
                    ]
                },
            ],



            {
                layerList: [
                    layer(ZeroLayer, { color: 0xaaaaaa }),
                    layer(LineLayer, { data: d.bitmex.买.盘口, color: 买颜色 }),
                    layer(LineLayer, { data: d.bitmex.卖.盘口, color: 卖颜色, 临时参数: '变成负数' }),
                    layer(LineLayer, { data: d.bitmex.买.净盘口, color: BTC颜色 }),
                    layer(LineLayer, { data: d.bitmex.买.净盘口_均线3, color: ETH颜色 }),
                ]
            },
            {
                layerList: [
                    layer(信号Layer, { data: d2.XBTUSD.hopex_信号_抄底, color: 买颜色 }),
                    layer(TextLayer, {
                        text:
                            `hopex_信号_抄底                    `,
                        color: ETH颜色,
                    })
                ]
            },
            {
                layerList: [
                    layer(信号Layer, { data: d.bitmex.信号_抄底hopex专用, color: 买颜色 }),
                    layer(TextLayer, {
                        text:
                            `信号_抄底hopex专用                    `,
                        color: ETH颜色,
                    })
                ]
            },
            {
                layerList: [
                    layer(信号Layer, { data: d.hopex_信号_抄底_上涨平仓, color: 买颜色 }),
                    layer(TextLayer, {
                        text:
                            `hopex_信号_摸顶_下跌平仓                    `,
                        color: ETH颜色,
                    })
                ]
            },

        ]
    }),

    // 实盘: (d, d2) => ({
    //     heightList: [0.5, 0.15, 0.1, 0.15, 0.1],
    //     items: [
    //         [

    //             {
    //                 numberColor: '0x000000',
    //                 layerList: [
    //                     layer(LineLayer, { data: d2.XBTUSD.hopex.价格, color: ETH颜色 }),
    //                 ]
    //             },
    //             {
    //                 numberColor: BTC颜色,
    //                 layerList: [
    //                     layer(LineLayer, { data: d2.XBTUSD.bitmex.价格, color: BTC颜色 }),
    //                     layer(TextLayer, {
    //                         text:
    //                             `hopex:${lastNumber(d2.XBTUSD.hopex.价格).toFixed(2)}  ` +
    //                             `bitmex:${lastNumber(d.bitmex.价格).toFixed(2)}      ` +
    //                             `期货30秒内成交量:${d.期货30秒内成交量().toFixed(2)}万   ` +
    //                             `买1  :${(lastNumber(d.bitmex.买.盘口1) / 10000).toFixed(2)}万  ` +
    //                             `卖1  :${(lastNumber(d.bitmex.卖.盘口1) / 10000).toFixed(2)}万   ` +
    //                             `期货波动率:${lastNumber(d.bitmex.价格_波动率30).toFixed(2)}`,
    //                         color: d === d2.XBTUSD ? BTC颜色 : ETH颜色,
    //                     })
    //                 ]
    //             },
    //             {
    //                 numberColor: 石青,
    //                 numberX: 100,
    //                 layerList: [
    //                     layer(LineLayer, { data: d.bitmex.价格_波动率30, color: 石青 }),
    //                 ]
    //             },
    //             {
    //                 numberColor: 波动率颜色,
    //                 numberX: 100,
    //                 layerList: [
    //                     layer(ZeroLayer, { color: 波动率颜色 }),
    //                     layer(LineLayer, { data: d.bitmex.买.净成交量_累加60, color: 波动率颜色 }),
    //                 ]
    //             },
    //         ],
    //         {
    //             layerList: [
    //                 layer(信号Layer, { data: d.bitmex.信号_摸顶, color: 卖颜色 }),
    //                 layer(TextLayer, {
    //                     text:
    //                         `上涨摸顶                    `,
    //                     color: ETH颜色,
    //                 })
    //             ]
    //         },
    //         {
    //             layerList: [
    //                 layer(信号Layer, { data: d.bitmex_信号_追涨, color: 买颜色 }),
    //                 layer(TextLayer, {
    //                     text:
    //                         `上涨追涨                    `,
    //                     color: ETH颜色,
    //                 })
    //             ]
    //         },

    //         {
    //             layerList: [
    //                 layer(信号Layer, { data: d.bitmex.信号_抄底, color: 买颜色 }),
    //                 layer(TextLayer, {
    //                     text:
    //                         `下跌抄底                    `,
    //                     color: ETH颜色,
    //                 })
    //             ]
    //         },
    //         {
    //             layerList: [
    //                 layer(信号Layer, { data: d.bitmex_信号_追跌, color: 卖颜色 }),
    //                 layer(TextLayer, {
    //                     text:
    //                         `下跌追跌                    `,
    //                     color: ETH颜色,
    //                 })
    //             ]
    //         },

    //     ]
    // }),


    // 实盘hopex: (d, d2) => ({
    //     heightList: [0.5, 0.15, 0.1, 0.15, 0.1],
    //     items: [
    //         [
    //             {
    //                 numberColor: '0x000000',
    //                 layerList: [
    //                     layer(LineLayer, { data: d2.XBTUSD.hopex.价格, color: ETH颜色 }),
    //                 ]
    //             },
    //             {
    //                 numberColor: BTC颜色,
    //                 layerList: [
    //                     layer(LineLayer, { data: d2.XBTUSD.bitmex.价格, color: BTC颜色 }),
    //                     layer(TextLayer, {
    //                         text:
    //                             `hopex:${lastNumber(d2.XBTUSD.hopex.价格).toFixed(2)}  ` +
    //                             `bitmex:${lastNumber(d.bitmex.价格).toFixed(2)}      ` +
    //                             `期货30秒内成交量:${d.期货30秒内成交量().toFixed(2)}万   ` +
    //                             `买1  :${(lastNumber(d.bitmex.买.盘口1) / 10000).toFixed(2)}万  ` +
    //                             `卖1  :${(lastNumber(d.bitmex.卖.盘口1) / 10000).toFixed(2)}万   ` +
    //                             `期货波动率:${lastNumber(d.bitmex.价格_波动率30).toFixed(2)}`,
    //                         color: d === d2.XBTUSD ? BTC颜色 : ETH颜色,
    //                     })
    //                 ]
    //             },
    //             {
    //                 numberColor: 石青,
    //                 numberX: 100,
    //                 layerList: [
    //                     layer(LineLayer, { data: d.bitmex.价格_波动率30, color: 石青 }),
    //                 ]
    //             }],
    //         {
    //             layerList: [
    //                 layer(信号Layer, { data: d.bitmex.信号_摸顶, color: 卖颜色 }),
    //                 layer(TextLayer, {
    //                     text:
    //                         `上涨摸顶                    `,
    //                     color: ETH颜色,
    //                 })
    //             ]
    //         },
    //         {
    //             layerList: [
    //                 layer(信号Layer, { data: d.bitmex.信号_抄底, color: 买颜色 }),
    //                 layer(TextLayer, {
    //                     text:
    //                         `下跌抄底                    `,
    //                     color: ETH颜色,
    //                 })
    //             ]
    //         },
    //         {
    //             layerList: [
    //                 layer(信号Layer, { data: d2.XBTUSD.hopex_信号_摸顶, color: 买颜色 }),
    //                 layer(TextLayer, {
    //                     text:
    //                         `信号hopex_上涨                    `,
    //                     color: ETH颜色,
    //                 })
    //             ]
    //         },
    //         {
    //             layerList: [
    //                 layer(信号Layer, { data: d2.XBTUSD.hopex_信号_抄底, color: 卖颜色 }),
    //                 layer(TextLayer, {
    //                     text:
    //                         `信号hopex_下跌                    `,
    //                     color: ETH颜色,
    //                 })
    //             ]
    //         },

    //     ]
    // }),

    // 复盘下跌动力: (d, d2) => ({
    //     heightList: [0.4, 0.3, 0.3],
    //     items: [
    //         [{
    //             numberColor: BTC颜色,
    //             layerList: [
    //                 layer(LineLayer, { data: d2.XBTUSD.bitmex.价格, color: BTC颜色 }),
    //                 //layer(LineLayer, { data: d2.XBTUSD.期货.最低价10, color: 波动率颜色 }),
    //                 // layer(LineLayer, { data: d2.XBTUSD.期货.价格均线60, color: 0xffffff }),
    //             ]
    //         },

    //         // {
    //         //     numberColor: 波动率颜色,
    //         //     numberX: 100,
    //         //     layerList: [
    //         //         layer(ZeroLayer, { color: ETH颜色 }),
    //         //         layer(LineLayer, { data: d.期货.净成交量60, color: ETH颜色 }),
    //         //     ]
    //         // },
    //         // {
    //         //     numberColor: 卖颜色,
    //         //     layerList: [
    //         //         layer(ZeroLayer, { color: 卖颜色 }),
    //         //         layer(LineLayer, { data: d.期货.价格差_除以时间, color: 卖颜色 }),
    //         //     ]
    //         // },


    //         // {
    //         //     layerList: [
    //         //         layer(LineLayer, { data: d2.XBTUSD.期货.波动率, color: 石青 }),
    //         //     ]
    //         // },
    //         {
    //             numberColor: 买颜色,
    //             layerList: [
    //                 layer(ZeroLayer, { color: 买颜色 }),
    //                 layer(LineLayer, { data: d.bitmex.震荡指数, color: 买颜色 }),
    //             ]
    //         },
    //             // {
    //             //     layerList: [
    //             //         layer(LineLayer, { data: d2.XBTUSD.期货.阻力3跌, color: 波动率颜色 }),
    //             //     ]
    //             // },
    //         ],
    //         [
    //             // {
    //             //     numberColor: BTC颜色,
    //             //     layerList: [
    //             //         layer(LineLayer, { data: d2.XBTUSD.期货.成交量买均线5, color: 买颜色 }),
    //             //         layer(LineLayer, { data: d2.XBTUSD.期货.成交量卖均线5, color: 卖颜色 }),
    //             //     ]
    //             // },

    //             // {
    //             //     numberColor: BTC颜色,
    //             //     layerList: [
    //             //         layer(LineLayer, { data: d2.XBTUSD.期货.下跌.累计成交量, color: ETH颜色 }),
    //             //     ]
    //             // },
    //             {
    //                 numberColor: BTC颜色,
    //                 layerList: [
    //                     layer(LineLayer, { data: d2.XBTUSD.bitmex.下跌.价差, color: 波动率颜色 }),
    //                     layer(LineLayer, { data: d2.XBTUSD.bitmex.价格_波动率30, color: 石青 }),
    //                 ]
    //             },
    //             // {
    //             //     layerList: [
    //             //         layer(LineLayer, { data: d2.XBTUSD.期货.波动率, color: 石青 }),
    //             //     ]
    //             // },
    //             {
    //                 numberColor: 买颜色,
    //                 layerList: [
    //                     layer(ZeroLayer, { color: 买颜色 }),
    //                     layer(LineLayer, { data: d.bitmex.震荡指数_macd.DIF, color: 买颜色1 }),
    //                     layer(LineLayer, { data: d.bitmex.震荡指数_macd.DEM, color: 买颜色 }),
    //                 ]
    //             },


    //         ],
    //         [
    //             {
    //                 numberColor: BTC颜色,
    //                 yCoordinate: '对数',
    //                 layerList: [
    //                     layer(LineLayer, { data: d2.XBTUSD.bitmex.下跌.动力, color: ETH颜色 }),
    //                 ]
    //             },

    //         ]

    //     ]
    // }),
    // 复盘上涨动力: (d, d2) => ({
    //     heightList: [0.4, 0.3, 0.3],
    //     items: [
    //         [{
    //             numberColor: BTC颜色,
    //             layerList: [
    //                 layer(LineLayer, { data: d2.XBTUSD.bitmex.价格, color: BTC颜色 }),
    //                 // layer(LineLayer, { data: d2.XBTUSD.期货.最高价10, color: 波动率颜色 }),
    //                 // layer(LineLayer, { data: d2.XBTUSD.期货.价格均线60, color: 0xffffff }),
    //             ]
    //         },

    //         {
    //             numberColor: 波动率颜色,
    //             numberX: 100,
    //             layerList: [
    //                 layer(ZeroLayer, { color: ETH颜色 }),
    //                 layer(LineLayer, { data: d.bitmex.买.净成交量_累加60, color: ETH颜色 }),
    //             ]
    //         },

    //         {
    //             numberColor: 买颜色,
    //             layerList: [
    //                 layer(ZeroLayer, { color: 买颜色 }),
    //                 layer(LineLayer, { data: d.bitmex.价格差_除以时间, color: 买颜色 }),
    //             ]
    //         },



    //         ],
    //         [

    //             {
    //                 numberColor: BTC颜色,
    //                 layerList: [
    //                     layer(LineLayer, { data: d2.XBTUSD.bitmex.上涨.价差, color: 波动率颜色 }),
    //                 ]
    //             },



    //         ],
    //         [


    //             {
    //                 numberColor: BTC颜色,
    //                 yCoordinate: '对数',
    //                 layerList: [
    //                     layer(LineLayer, { data: d2.XBTUSD.bitmex.上涨.动力, color: ETH颜色 }),
    //                 ]
    //             },

    //         ]

    //     ]
    // }),
    // 大波动专用: (d, d2) => ({
    //     heightList: [0.6, 0.4],
    //     items: [
    //         [
    //             {
    //                 numberColor: '0x000000',
    //                 layerList: [
    //                     layer(LineLayer, { data: d2.XBTUSD.hopex.价格, color: ETH颜色 }),
    //                 ]
    //             },
    //             {

    //                 numberColor: 波动率颜色,
    //                 numberX: 100,
    //                 layerList: [
    //                     layer(ZeroLayer, { color: 波动率颜色 }),
    //                     layer(LineLayer, { data: d.bitmex.买.净成交量_累加60, color: 波动率颜色 }),
    //                 ]
    //             },
    //             {
    //                 numberColor: 石青,
    //                 numberX: 100,
    //                 layerList: [
    //                     layer(LineLayer, { data: d.bitmex.价格_波动率30, color: 石青 }),
    //                 ]
    //             },
    //             {
    //                 numberColor: BTC颜色,
    //                 layerList: [
    //                     layer(LineLayer, { data: d2.XBTUSD.bitmex.价格, color: BTC颜色 }),

    //                     layer(TextLayer, {
    //                         text:
    //                             `hopex:${lastNumber(d2.XBTUSD.hopex.价格).toFixed(2)}  ` +
    //                             `bitmex:${lastNumber(d.bitmex.价格).toFixed(2)}      ` +
    //                             `期货30秒内成交量:${d.期货30秒内成交量().toFixed(2)}万   ` +
    //                             `买1  :${(lastNumber(d.bitmex.买.盘口1) / 10000).toFixed(2)}万  ` +
    //                             `卖1  :${(lastNumber(d.bitmex.卖.盘口1) / 10000).toFixed(2)}万   ` +
    //                             `期货波动率:${lastNumber(d.bitmex.价格_波动率30).toFixed(2)}`,
    //                         color: d === d2.XBTUSD ? BTC颜色 : ETH颜色,
    //                     })

    //                 ]
    //             },
    //         ],


    //         {
    //             layerList: [
    //                 layer(ZeroLayer, { color: 0xaaaaaa }),
    //                 layer(LineLayer, { data: d.bitmex.买.盘口, color: 买颜色 }),
    //                 layer(LineLayer, { data: d.bitmex.卖.盘口, color: 卖颜色, 临时参数: '变成负数' }),
    //                 layer(LineLayer, { data: d.bitmex.买.净盘口, color: BTC颜色 }),
    //                 layer(LineLayer, { data: d.bitmex.买.净盘口_均线3, color: ETH颜色 }),
    //             ]
    //         },
    //     ]
    // }),
    // 测试盘口上涨: (d, d2) => ({
    //     heightList: [0.7, 0.3],
    //     items: [
    //         [
    //             {
    //                 layerList: [
    //                     layer(LineLayer, { data: d2.XBTUSD.hopex.价格, color: ETH颜色 }),
    //                 ]
    //             },
    //             {
    //                 numberColor: BTC颜色,
    //                 layerList: [
    //                     layer(LineLayer, { data: d2.XBTUSD.bitmex.价格, color: BTC颜色 }),
    //                     layer(TextLayer, {
    //                         text:
    //                             `hopex:${lastNumber(d2.XBTUSD.hopex.价格).toFixed(2)}  ` +
    //                             `bitmex:${lastNumber(d.bitmex.价格).toFixed(2)}      ` +
    //                             `期货30秒内成交量:${d.期货30秒内成交量().toFixed(2)}万   ` +
    //                             `买1  :${(lastNumber(d.bitmex.买.盘口1) / 10000).toFixed(2)}万  ` +
    //                             `卖1  :${(lastNumber(d.bitmex.卖.盘口1) / 10000).toFixed(2)}万   ` +
    //                             `期货波动率:${lastNumber(d.bitmex.价格_波动率30).toFixed(2)}`,
    //                         color: d === d2.XBTUSD ? BTC颜色 : ETH颜色,
    //                     })

    //                 ]
    //             },
    //             // {
    //             //     layerList: [
    //             //         layer(ZeroLayer, { color: 买颜色 }),
    //             //         layer(LineLayer, { data:  d.期货.bitmex_hopex_上涨相对差价macd.DIF, color: 买颜色1 }),
    //             //         layer(LineLayer, { data: d.期货.bitmex_hopex_上涨相对差价macd.DEM, color: 买颜色 }),
    //             //     ]
    //             // },

    //         ],
    //         {
    //             layerList: [
    //                 layer(ZeroLayer, { color: 0xaaaaaa }),
    //                 layer(LineLayer, { data: d.bitmex_hopex_上涨相对差价均线, color: 买颜色 }),
    //                 layer(LineLayer, { data: d.bitmex_hopex_上涨相对价差, color: 买颜色1 }),
    //             ]
    //         },
    //         // {
    //         //     layerList: [
    //         //         layer(信号Layer, { data: d.期货.信号_摸顶, color: 卖颜色 }),
    //         //     ]
    //         // },
    //     ]
    // }),
    // 测试盘口下跌: (d, d2) => ({
    //     heightList: [0.4, 0.3, 0.3],
    //     items: [
    //         [
    //             {
    //                 layerList: [
    //                     layer(LineLayer, { data: d2.XBTUSD.hopex.价格, color: ETH颜色 }),
    //                 ]
    //             },
    //             {
    //                 numberColor: BTC颜色,
    //                 layerList: [
    //                     layer(LineLayer, { data: d2.XBTUSD.bitmex.价格, color: BTC颜色 }),

    //                     layer(TextLayer, {
    //                         text:
    //                             `hopex:${lastNumber(d2.XBTUSD.hopex.价格).toFixed(2)}  ` +
    //                             `bitmex:${lastNumber(d.bitmex.价格).toFixed(2)}      ` +
    //                             `期货30秒内成交量:${d.期货30秒内成交量().toFixed(2)}万   ` +
    //                             `买1  :${(lastNumber(d.bitmex.买.盘口1) / 10000).toFixed(2)}万  ` +
    //                             `卖1  :${(lastNumber(d.bitmex.卖.盘口1) / 10000).toFixed(2)}万   ` +
    //                             `期货波动率:${lastNumber(d.bitmex.价格_波动率30).toFixed(2)}`,
    //                         color: d === d2.XBTUSD ? BTC颜色 : ETH颜色,
    //                     })

    //                 ]
    //             },
    //             // {
    //             //     layerList: [
    //             //         layer(ZeroLayer, { color: 卖颜色 }),
    //             //         layer(LineLayer, { data:  d.期货.bitmex_hopex_下跌相对差价macd.DIF, color: 卖颜色1 }),
    //             //         layer(LineLayer, { data: d.期货.bitmex_hopex_下跌相对差价macd.DEM, color: 卖颜色 }),
    //             //     ]
    //             // },
    //         ],
    //         {
    //             layerList: [
    //                 layer(信号Layer, { data: d.bitmex.信号_抄底盘口复盘专用, color: 卖颜色 }),
    //             ]
    //         },
    //         {
    //             layerList: [
    //                 layer(信号Layer, { data: d.bitmex.信号_抄底hopex专用, color: 卖颜色 }),
    //             ]
    //         },
    //     ]
    // }),

    // 上涨成交量与价差: (d, d2) => ({
    //     heightList: [0.4, 0.6],
    //     items: [
    //         [
    //             {
    //                 numberColor: BTC颜色,
    //                 layerList: [
    //                     layer(LineLayer, { data: d2.XBTUSD.bitmex.价格, color: BTC颜色 }),
    //                     layer(TextLayer, {
    //                         text:
    //                             `hopex:${lastNumber(d2.XBTUSD.hopex.价格).toFixed(2)}  ` +
    //                             `bitmex:${lastNumber(d.bitmex.价格).toFixed(2)}      ` +
    //                             `期货30秒内成交量:${d.期货30秒内成交量().toFixed(2)}万   ` +
    //                             `买1  :${(lastNumber(d.bitmex.买.盘口1) / 10000).toFixed(2)}万  ` +
    //                             `卖1  :${(lastNumber(d.bitmex.卖.盘口1) / 10000).toFixed(2)}万   ` +
    //                             `期货波动率:${lastNumber(d.bitmex.价格_波动率30).toFixed(2)}`,
    //                         color: d === d2.XBTUSD ? BTC颜色 : ETH颜色,
    //                     })

    //                 ]
    //             },
    //         ],
    //         [
    //             // {
    //             //     layerList: [
    //             //         layer(LineLayer, { data: d.期货.上涨.价差, color: 波动率颜色 }),
    //             //     ]

    //             // },
    //             // {
    //             //     layerList: [
    //             //         layer(LineLayer, { data: d.期货.上涨.累计成交量, color: ETH颜色 }),
    //             //     ]

    //             // },
    //             {
    //                 numberColor: 买颜色,
    //                 layerList: [
    //                     layer(LineLayer, { data: d.bitmex.累计成交量阈值, color: ETH颜色 }),
    //                     layer(LineLayer, { data: d.bitmex.上涨.累计成交量, color: 买颜色 }),
    //                 ]

    //             },
    //         ]
    //     ]
    // }),
    // 下跌成交量与价差: (d, d2) => ({
    //     heightList: [0.3, 0.7],
    //     items: [
    //         [
    //             {
    //                 numberColor: BTC颜色,
    //                 layerList: [
    //                     layer(LineLayer, { data: d2.XBTUSD.bitmex.价格, color: BTC颜色 }),
    //                     layer(TextLayer, {
    //                         text:
    //                             `hopex:${lastNumber(d2.XBTUSD.hopex.价格).toFixed(2)}  ` +
    //                             `bitmex:${lastNumber(d.bitmex.价格).toFixed(2)}      ` +
    //                             `期货30秒内成交量:${d.期货30秒内成交量().toFixed(2)}万   ` +
    //                             `买1  :${(lastNumber(d.bitmex.买.盘口1) / 10000).toFixed(2)}万  ` +
    //                             `卖1  :${(lastNumber(d.bitmex.卖.盘口1) / 10000).toFixed(2)}万   ` +
    //                             `期货波动率:${lastNumber(d.bitmex.价格_波动率30).toFixed(2)}`,
    //                         color: d === d2.XBTUSD ? BTC颜色 : ETH颜色,
    //                     })

    //                 ]
    //             },
    //         ],
    //         [
    //             //累计成交量阈值
    //             {
    //                 numberColor: 卖颜色,
    //                 layerList: [
    //                     layer(LineLayer, { data: d.bitmex.累计成交量阈值, color: ETH颜色 }),
    //                     layer(LineLayer, { data: d.bitmex.下跌.累计成交量, color: 卖颜色 }),
    //                 ]

    //             },

    //             // {numberColor: ETH颜色,
    //             //     layerList: [

    //             //     ]

    //             // },
    //             {
    //                 numberColor: BTC颜色,
    //                 layerList: [
    //                     layer(LineLayer, { data: d.bitmex.实时与标准成交量之差, color: BTC颜色 }),
    //                 ]

    //             },
    //             // {价格差_除以时间
    //             //     numberColor: BTC颜色,
    //             //     layerList: [
    //             //         layer(LineLayer, { data: d.期货.下跌.动力, color: BTC颜色 }),
    //             //     ]
    //             // },
    //             {
    //                 numberColor: 石青,
    //                 layerList: [
    //                     layer(LineLayer, { data: d.bitmex.实时与标准成交量之差macd.DIF, color: 卖颜色1 }),
    //                     layer(LineLayer, { data: d.bitmex.实时与标准成交量之差macd.DEM, color: 卖颜色 }),
    //                 ]
    //             },
    //         ]
    //     ]
    // }),
    // 震荡指数: (d, d2) => ({
    //     heightList: [0.4, 0.6],
    //     items: [
    //         [
    //             {
    //                 numberColor: BTC颜色,
    //                 layerList: [
    //                     layer(LineLayer, { data: d2.XBTUSD.bitmex.价格, color: BTC颜色 }),
    //                     layer(TextLayer, {
    //                         text:
    //                             `hopex:${lastNumber(d2.XBTUSD.hopex.价格).toFixed(2)}  ` +
    //                             `bitmex:${lastNumber(d.bitmex.价格).toFixed(2)}      ` +
    //                             `期货30秒内成交量:${d.期货30秒内成交量().toFixed(2)}万   ` +
    //                             `买1  :${(lastNumber(d.bitmex.买.盘口1) / 10000).toFixed(2)}万  ` +
    //                             `卖1  :${(lastNumber(d.bitmex.卖.盘口1) / 10000).toFixed(2)}万   ` +
    //                             `期货波动率:${lastNumber(d.bitmex.价格_波动率30).toFixed(2)}`,
    //                         color: d === d2.XBTUSD ? BTC颜色 : ETH颜色,
    //                     })
    //                 ]
    //             },
    //         ],
    //         [

    //             // {   numberColor: 波动率颜色,
    //             //     layerList: [
    //             //         layer(LineLayer, { data: d.期货.下跌.震荡指数_最高30, color: 波动率颜色 }),
    //             //     ]

    //             // },

    //             {
    //                 numberColor: 波动率颜色,
    //                 layerList: [
    //                     layer(LineLayer, { data: d.bitmex.下跌.震荡指数_最高30, color: 波动率颜色 }),
    //                 ]

    //             },
    //             {
    //                 numberColor: 买颜色,
    //                 layerList: [
    //                     layer(ZeroLayer, { color: BTC颜色 }),
    //                     layer(LineLayer, { data: d.bitmex.震荡指数_macd.DIF, color: 买颜色1 }),
    //                     layer(LineLayer, { data: d.bitmex.震荡指数_macd.DEM, color: 买颜色 }),
    //                 ]
    //             },
    //             {
    //                 numberColor: ETH颜色,
    //                 layerList: [
    //                     layer(LineLayer, { data: d.bitmex.震荡指数, color: ETH颜色 }),
    //                 ]
    //             },

    //             // {numberColor: ETH颜色,
    //             //     layerList: [
    //             //         layer(LineLayer, { data: d.期货.震荡指数, color: ETH颜色 }),
    //             //     ]
    //             // },

    //         ],
    //     ]
    // }),
    // 价格速度: (d, d2) => ({
    //     heightList: [0.4, 0.6],
    //     items: [
    //         [
    //             {
    //                 numberColor: BTC颜色,
    //                 layerList: [
    //                     layer(LineLayer, { data: d2.XBTUSD.bitmex.价格, color: BTC颜色 }),
    //                     layer(TextLayer, {
    //                         text:
    //                             `hopex:${lastNumber(d2.XBTUSD.hopex.价格).toFixed(2)}  ` +
    //                             `bitmex:${lastNumber(d.bitmex.价格).toFixed(2)}      ` +
    //                             `期货30秒内成交量:${d.期货30秒内成交量().toFixed(2)}万   ` +
    //                             `买1  :${(lastNumber(d.bitmex.买.盘口1) / 10000).toFixed(2)}万  ` +
    //                             `卖1  :${(lastNumber(d.bitmex.卖.盘口1) / 10000).toFixed(2)}万   ` +
    //                             `期货波动率:${lastNumber(d.bitmex.价格_波动率30).toFixed(2)}`,
    //                         color: d === d2.XBTUSD ? BTC颜色 : ETH颜色,
    //                     })

    //                 ]
    //             },
    //         ],
    //         [
    //             {
    //                 numberColor: ETH颜色,
    //                 layerList: [
    //                     layer(ZeroLayer, { color: ETH颜色 }),
    //                     layer(LineLayer, { data: d.bitmex.价格差_除以时间, color: ETH颜色 }),
    //                 ]
    //             },
    //             {
    //                 numberColor: 波动率颜色,
    //                 layerList: [
    //                     layer(LineLayer, { data: d.bitmex.下跌.价差, color: 卖颜色 }),
    //                     layer(LineLayer, { data: d.bitmex.上涨.价差, color: 买颜色 }),
    //                 ]
    //             },
    //         ],
    //     ]
    // }),
    // 成交提示: (d, d2) => ({
    //     heightList: [0.4, 0.2, 0.4],
    //     items: [
    //         [
    //             {
    //                 numberColor: BTC颜色,
    //                 layerList: [
    //                     layer(LineLayer, { data: d2.XBTUSD.bitmex.价格, color: BTC颜色 }),
    //                     layer(TextLayer, {
    //                         text:
    //                             `hopex:${lastNumber(d2.XBTUSD.hopex.价格).toFixed(2)}  ` +
    //                             `bitmex:${lastNumber(d.bitmex.价格).toFixed(2)}      ` +
    //                             `期货30秒内成交量:${d.期货30秒内成交量().toFixed(2)}万   ` +
    //                             `买1  :${(lastNumber(d.bitmex.买.盘口1) / 10000).toFixed(2)}万  ` +
    //                             `卖1  :${(lastNumber(d.bitmex.卖.盘口1) / 10000).toFixed(2)}万   ` +
    //                             `期货波动率:${lastNumber(d.bitmex.价格_波动率30).toFixed(2)}`,
    //                         color: d === d2.XBTUSD ? BTC颜色 : ETH颜色,
    //                     })

    //                 ]
    //             },
    //         ],
    //         {
    //             layerList: [
    //                 layer(信号Layer, { data: d.成交提示, color: 买颜色 }),
    //                 layer(TextLayer, {
    //                     text:
    //                         `成交提示                    `,
    //                     color: ETH颜色,
    //                 })
    //             ]
    //         },
    //         [
    //             {
    //                 numberColor: 波动率颜色,
    //                 layerList: [
    //                     layer(LineLayer, { data: d.bitmex.价格差_除以时间, color: 波动率颜色 }),
    //                 ]
    //             },


    //         ],
    //     ]
    // }),
    // 价差走平: (d, d2) => ({
    //     heightList: [0.4, 0.2, 0.4],
    //     items: [
    //         [
    //             {
    //                 numberColor: BTC颜色,
    //                 layerList: [
    //                     layer(LineLayer, { data: d2.XBTUSD.bitmex.价格, color: BTC颜色 }),
    //                     layer(LineLayer, { data: d2.XBTUSD.bitmex.下跌.x秒内极值点价格, color: 0xffffff }),
    //                     layer(LineLayer, { data: d.bitmex.价格_最低60, color: 波动率颜色 }),
    //                     layer(TextLayer, {
    //                         text:
    //                             `hopex:${lastNumber(d2.XBTUSD.hopex.价格).toFixed(2)}  ` +
    //                             `bitmex:${lastNumber(d.bitmex.价格).toFixed(2)}      ` +
    //                             `期货30秒内成交量:${d.期货30秒内成交量().toFixed(2)}万   ` +
    //                             `买1  :${(lastNumber(d.bitmex.买.盘口1) / 10000).toFixed(2)}万  ` +
    //                             `卖1  :${(lastNumber(d.bitmex.卖.盘口1) / 10000).toFixed(2)}万   ` +
    //                             `期货波动率:${lastNumber(d.bitmex.价格_波动率30).toFixed(2)}`,
    //                         color: d === d2.XBTUSD ? BTC颜色 : ETH颜色,
    //                     })

    //                 ]
    //             },

    //         ],
    //         {
    //             layerList: [
    //                 layer(信号Layer, { data: d.bitmex.信号_抄底, color: 买颜色 }),
    //             ]
    //         },
    //         [

    //             {
    //                 numberColor: BTC颜色,
    //                 layerList: [
    //                     layer(LineLayer, { data: d.bitmex.下跌.x秒内极值点价格, color: BTC颜色 }),
    //                 ]
    //             },
    //             {
    //                 numberColor: BTC颜色,
    //                 layerList: [
    //                     layer(LineLayer, { data: d.bitmex.下跌.动态时间_x秒, color: ETH颜色 }),
    //                 ]
    //             },
    //             {
    //                 numberColor: 买颜色,
    //                 layerList: [
    //                     layer(LineLayer, { data: d.bitmex.下跌.动态时间_y秒, color: 买颜色 }),
    //                 ]
    //             },
    //         ],
    //     ]
    // }),

    // 双开,双平,多换,空换,多平,空平,空开,多开,
    '螺纹1905': (d, d2) => ({
        heightList: [0.4, 0.4, 0.2],
        items: [
            [

                {
                    numberColor: 波动率颜色,
                    layerList: [
                        layer(ZeroLayer, { color: 波动率颜色 }),
                        layer(LineLayer, { data: d2.ctp.买.净成交量_累加60, color: 波动率颜色 }),
                    ]
                },
                {
                    numberColor: BTC颜色,
                    layerList: [
                        layer(LineLayer, { data: d2.ctp.价格, color: BTC颜色 }),
                    ]
                },
            ],
            {
                layerList: [
                    layer(ZeroLayer, { color: 0xaaaaaa }),
                    layer(LineLayer, { data: d2.ctp.买.成交量, color: 买颜色 }),
                    layer(LineLayer, { data: d2.ctp.卖.成交量, color: 卖颜色, 临时参数: '变成负数' }),
                    layer(TextLayer, { text: '成交量买 成交量卖      ', color: 0xffff00 })
                ]
            },
            {
                layerList: [
                    layer(LineLayer, { data: d2.ctp.买.盘口, color: 买颜色 }),
                    layer(LineLayer, { data: d2.ctp.卖.盘口, color: 卖颜色 }),
                    layer(TextLayer, { text: '盘口买 盘口卖      ', color: 0xffff00 })
                ]
            },
        ]
    }),
    // 双开,双平,多换,空换,多平,空平,空开,多开,
    '螺纹成交量1': (d, d2) => ({
        heightList: [0.4, 0.2, 0.2, 0.2],
        items: [
            [
                {
                    numberColor: BTC颜色,
                    layerList: [
                        layer(LineLayer, { data: d2.ctp.价格, color: BTC颜色 }),
                    ]
                },
                {
                    numberColor: 波动率颜色,
                    layerList: [
                        layer(ZeroLayer, { color: 波动率颜色 }),
                        layer(LineLayer, { data: d2.ctp.买.净成交量_累加60, color: 波动率颜色 }),
                    ]
                },
            ],
            {
                layerList: [
                    layer(ZeroLayer, { color: 0xaaaaaa }),
                    layer(LineLayer, { data: d2.ctp.成交性质.双开, color: BTC颜色 }),
                    layer(LineLayer, { data: d2.ctp.成交性质.双平, color: ETH颜色 }),
                    layer(LineLayer, { data: d2.ctp.买.成交量, color: 买颜色 }),
                    layer(LineLayer, { data: d2.ctp.卖.成交量, color: 卖颜色, 临时参数: '变成负数' }),
                    layer(TextLayer, { text: '双开 双平      ', color: 0xffff00 })
                ]
            },
            {
                layerList: [
                    layer(ZeroLayer, { color: 0xaaaaaa }),
                    layer(LineLayer, { data: d2.ctp.成交性质.多换, color: BTC颜色 }),
                    layer(LineLayer, { data: d2.ctp.成交性质.空换, color: ETH颜色 }),
                    layer(LineLayer, { data: d2.ctp.买.成交量, color: 买颜色 }),
                    layer(LineLayer, { data: d2.ctp.卖.成交量, color: 卖颜色, 临时参数: '变成负数' }),
                    layer(TextLayer, { text: '多换 空换      ', color: 0xffff00 })
                ]
            },
            // {
            //     layerList: [
            //         layer(ZeroLayer, { color: 0xaaaaaa }),
            //         layer(LineLayer, { data: d2.ctp.买.成交量, color: 买颜色 }),
            //         layer(LineLayer, { data: d2.ctp.卖.成交量, color: 卖颜色, 临时参数: '变成负数' }),
            //         layer(TextLayer, { text: '成交量买 成交量卖      ', color: 0xffff00 })
            //     ]
            // },
            {
                layerList: [
                    layer(ZeroLayer, { color: 0xaaaaaa }),
                    layer(LineLayer, { data: d2.ctp.买.盘口, color: 买颜色 }),
                    layer(LineLayer, { data: d2.ctp.卖.盘口, color: 卖颜色, 临时参数: '变成负数' }),
                    layer(LineLayer, { data: d2.ctp.买.净盘口_均线3, color: ETH颜色 }),
                    layer(TextLayer, { text: '盘口买 盘口卖      ', color: 0xffff00 })
                ]
            },

        ]
    }),
    // 双开,双平,多换,空换,多平,空平,空开,多开,
    '螺纹成交量2': (d, d2) => ({
        heightList: [0.4, 0.2, 0.2, 0.2],
        items: [
            [
                {
                    numberColor: 'ETH颜色',
                    layerList: [
                        layer(ZeroLayer, { color: ETH颜色 }),
                        layer(LineLayer, { data: d2.ctp.阻力3涨, color: 买颜色 }),
                        layer(LineLayer, { data: d2.ctp.阻力3跌, color: 卖颜色 }),
                    ]
                },
                {
                    numberColor: BTC颜色,
                    layerList: [
                        layer(LineLayer, { data: d2.ctp.价格, color: BTC颜色 }),
                    ]
                },
                {
                    numberColor: 波动率颜色,
                    layerList: [
                        layer(ZeroLayer, { color: 波动率颜色 }),
                        layer(LineLayer, { data: d2.ctp.买.净成交量_累加60, color: 波动率颜色 }),
                    ]
                },
            ],
            {
                layerList: [
                    layer(ZeroLayer, { color: 0xaaaaaa }),
                    layer(LineLayer, { data: d2.ctp.成交性质.多平, color: BTC颜色 }),
                    layer(LineLayer, { data: d2.ctp.成交性质.空平, color: ETH颜色 }),
                    layer(LineLayer, { data: d2.ctp.买.成交量, color: 买颜色 }),
                    layer(LineLayer, { data: d2.ctp.卖.成交量, color: 卖颜色, 临时参数: '变成负数' }),
                    layer(TextLayer, { text: '多平 空平      ', color: 0xffff00 })
                ]
            },
            {
                layerList: [
                    layer(ZeroLayer, { color: 0xaaaaaa }),
                    layer(LineLayer, { data: d2.ctp.成交性质.空开, color: BTC颜色 }),
                    layer(LineLayer, { data: d2.ctp.成交性质.多开, color: ETH颜色 }),
                    layer(LineLayer, { data: d2.ctp.买.成交量, color: 买颜色 }),
                    layer(LineLayer, { data: d2.ctp.卖.成交量, color: 卖颜色, 临时参数: '变成负数' }),
                    layer(TextLayer, { text: '空开 多开      ', color: 0xffff00 })
                ]
            },
            // {
            //     layerList: [
            //         layer(ZeroLayer, { color: 0xaaaaaa }),
            //         layer(LineLayer, { data: d2.ctp.买.成交量, color: 买颜色 }),
            //         layer(LineLayer, { data: d2.ctp.卖.成交量, color: 卖颜色, 临时参数: '变成负数' }),
            //         layer(TextLayer, { text: '成交量买 成交量卖      ', color: 0xffff00 })
            //     ]
            // },
            {
                layerList: [
                    layer(ZeroLayer, { color: 0xaaaaaa }),
                    layer(LineLayer, { data: d2.ctp.买.盘口, color: 买颜色 }),
                    layer(LineLayer, { data: d2.ctp.卖.盘口, color: 卖颜色, 临时参数: '变成负数' }),
                    layer(LineLayer, { data: d2.ctp.买.净盘口_均线3, color: ETH颜色 }),
                    layer(TextLayer, { text: '盘口买 盘口卖      ', color: 0xffff00 })
                ]
            },

        ]
    }),

    着笔: (d, d2) => ({
        heightList: [0.5, 0.5],
        items: [
            [{
                numberColor: BTC颜色,
                layerList: [
                    layer(LineLayer, { data: d2.XBTUSD.bitmex.着笔.price, color: BTC颜色 }),
                ]
            },
            {
                numberColor: 石青,
                numberX: 100,
                layerList: [
                    layer(ZeroLayer, { color: 0xaaaaaa }),
                    layer(LineLayer, { data: d.bitmex.着笔.涨跌, color: 石青 }),
                ]
            },],

            {
                layerList: [
                    layer(LineLayer, { data: d2.XBTUSD.bitmex.着笔.size, color: 0xffffff }),
                ]
            },
        ]
    }),


    '3D 测试': (d, d2) => ({
        heightList: [0.4, 0.4, 0.2],
        items: [
            {
                numberColor: BTC颜色,
                layerList: [
                    layer(KLineLayer, { data: d2.XBTUSD.bitmex.KLine }),
                    layer(笔Layer, { data: get笔Index(d2.XBTUSD.bitmex.KLine), color: 0xffff00 }),
                    layer(线段Layer, { data: get线段(get笔Index(d2.XBTUSD.bitmex.KLine)), color: 0xaa0000 }),
                    layer(合并后的Layer, { data: 合并后的K线(d2.XBTUSD.bitmex.KLine), color: 0xffff00 }),
                ]
            },
            {
                layerList: [
                    layer(ZeroLayer, { color: 0xaaaaaa }),
                    layer(LineLayer, { data: d.bitmex.买.成交量, color: 买颜色 }),
                    layer(LineLayer, { data: d.bitmex.卖.成交量, color: 卖颜色, 临时参数: '变成负数' }),
                    layer(TextLayer, { text: '成交量买 成交量卖      ', color: 0xffff00 })
                ]
            },
            {
                layerList: [
                    layer(LineLayer, { data: d.bitmex.买.盘口, color: 买颜色 }),
                    layer(LineLayer, { data: d.bitmex.卖.盘口, color: 卖颜色 }),
                    layer(TextLayer, { text: '盘口买 盘口卖      ', color: 0xffff00 })
                ]
            },
        ]
    }),

    'ctp波动_测试': (d, d2) => ({
        heightList: [0.6, 0.4],
        items: [
            [
                {
                    layerList: [
                        layer(ZeroLayer, { color: 波动率颜色 }),
                        layer(LineLayer, { data: d2.ctp.波动_测试.净成交量_累加10, color: 波动率颜色 }),
                    ]
                },
                {
                    numberColor: BTC颜色,
                    layerList: [
                        layer(LineLayer, { data: d2.ctp.波动_测试.价格, color: BTC颜色 }),
                        //layer(LineLayer, { data: d.bitmex.波动_测试.买均价_10, color: 买颜色 }),
                        //layer(LineLayer, { data: d.bitmex.波动_测试.卖均价_10, color: 卖颜色 }),
                    ]
                },
            ],

            {
                layerList: [
                    layer(BarLayer, { data: d2.ctp.波动_测试.持续秒, color: 0xffffff }),
                ]
            },
        ]
    }),


    hopex: (d, d2) => ({
        heightList: [0.2, 0.2, 0.2, 0.2, 0.2],
        items: [
            [
                {
                    numberColor: '0x000000',
                    layerList: [
                        layer(LineLayer, { data: d2.XBTUSD.hopex.价格, color: ETH颜色 }),
                    ]
                },
            ],
            {
                layerList: [
                    layer(信号Layer, { data: d2.XBTUSD.hopex_信号_抄底_上涨平仓, color: 卖颜色 }),
                ]
            },
            {
                layerList: [
                    layer(信号Layer, { data: d2.XBTUSD.hopex_信号_摸顶_下跌平仓, color: 买颜色 }),
                ]
            },
            {
                layerList: [
                    layer(信号Layer, { data: d2.XBTUSD.hopex_信号_摸顶, color: 卖颜色 }),
                ]
            },
            {
                layerList: [
                    layer(信号Layer, { data: d2.XBTUSD.hopex_信号_抄底, color: 买颜色 }),
                ]
            },
        ]
    }),

    '波动_测试': (d, d2) => ({
        heightList: [0.6, 0.4],
        items: [
            [
                {
                    layerList: [
                        layer(ZeroLayer, { color: 波动率颜色 }),
                        layer(LineLayer, { data: d.bitmex.波动_测试.净成交量_累加10, color: 波动率颜色 }),
                    ]
                },
                {
                    numberColor: BTC颜色,
                    layerList: [
                        layer(LineLayer, { data: d.bitmex.波动_测试.价格, color: BTC颜色 }),
                        //layer(LineLayer, { data: d.bitmex.波动_测试.买均价_10, color: 买颜色 }),
                        //layer(LineLayer, { data: d.bitmex.波动_测试.卖均价_10, color: 卖颜色 }),
                    ]
                },
            ],

            {
                layerList: [
                    layer(BarLayer, { data: d.bitmex.波动_测试.持续秒, color: 0xffffff }),
                ]
            },
        ]
    }),

    hopex原始数据: (d, d2) => ({
        heightList: [0.4, 0.4, 0.2],
        items: [
            [
                {
                    numberColor: '0x000000',
                    layerList: [
                        layer(LineLayer, { data: d2.XBTUSD.hopex.价格, color: ETH颜色 }),
                    ]
                },
                {
                    numberColor: BTC颜色,
                    layerList: [
                        layer(LineLayer, { data: d2.XBTUSD.bitmex.价格, color: BTC颜色 }),
                    ]
                },
                {
                    numberColor: 波动率颜色,
                    numberX: 100,
                    layerList: [
                        layer(ZeroLayer, { color: 波动率颜色 }),
                        layer(LineLayer, { data: d.bitmex.买.净成交量_累加60, color: 波动率颜色 }),
                        layer(LineLayer, { data: d.hopex.买.净成交量_累加60乘以10, color: 石青 }),
                    ]
                },
            ],

            {
                layerList: [
                    layer(ZeroLayer, { color: 0xaaaaaa }),

                    layer(LineLayer, { data: d.hopex.买.成交量, color: 买颜色 }),
                    layer(LineLayer, { data: d.hopex.卖.成交量, color: 卖颜色, 临时参数: '变成负数' }),
                    //layer(LineLayer, { data: d.hopex.卖.净成交量_累加10, color: ETH颜色 }),
                    layer(LineLayer, { data: d.hopex.买.净成交量_累加10, color: BTC颜色 }),
                    //layer(LineLayer, { data: d.期货.净成交量均线10, color: ETH颜色 }),
                    layer(TextLayer, { text: '成交量买 成交量卖      ', color: 0xffff00 })
                ]
            },
            // {
            //     layerList: [
            //         layer(LineLayer, { data: d.期货.买.盘口, color: 买颜色 }),
            //         layer(LineLayer, { data: d.期货.卖.盘口, color: 卖颜色 }),
            //         layer(TextLayer, { text: '盘口买 盘口卖      ', color: 0xffff00 })
            //     ]
            // },
            {
                layerList: [
                    layer(ZeroLayer, { color: 0xaaaaaa }),
                    layer(LineLayer, { data: d.hopex.买.盘口, color: 买颜色1 }),
                    layer(LineLayer, { data: d.hopex.卖.盘口, color: 卖颜色1, 临时参数: '变成负数' }),
                    //layer(LineLayer, { data: d.期货.买.净盘口, color: BTC颜色 }),
                    layer(LineLayer, { data: d.hopex.买.净盘口_均线3, color: ETH颜色 }),
                ]
            },
        ]
    }),


   

} 