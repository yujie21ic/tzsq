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
        heightList: [0.4, 0.15, 0.15, 0.15, 0.15],
        items: [
            [
                {
                    layerList: [
                        layer(LineLayer, { data: d2.XBTUSD.hopex.价格, color: ETH颜色 }),
                    ]
                },
                // {

                {

                    numberColor: 波动率颜色,
                    numberX: 100,
                    layerList: [
                        layer(ZeroLayer, { color: 波动率颜色 }),
                        layer(LineLayer, { data: d.期货.买.净成交量_累加60, color: 波动率颜色 }),
                    ]
                },
                {
                    numberColor: 石青,
                    numberX: 100,
                    layerList: [
                        layer(LineLayer, { data: d.期货.价格_波动率30, color: 石青 }),
                    ]
                },
                {
                    numberColor: BTC颜色,
                    layerList: [
                        layer(LineLayer, { data: d2.XBTUSD.期货.价格, color: BTC颜色 }),

                        layer(TextLayer, {
                            text:
                                `hopex:${lastNumber(d2.XBTUSD.hopex.价格).toFixed(2)}  ` +
                                `bitmex:${lastNumber(d.期货.价格).toFixed(2)}      ` +
                                `期货30秒内成交量:${d.期货30秒内成交量().toFixed(2)}万   ` +
                                `期货波动率:${lastNumber(d.期货.价格_波动率30).toFixed(2)}`,
                            color: d === d2.XBTUSD ? BTC颜色 : ETH颜色,
                        })

                    ]
                },
            ],

            {
                layerList: [
                    layer(ZeroLayer, { color: 0xaaaaaa }),
                    layer(LineLayer, { data: d.期货.买.盘口, color: 买颜色 }),
                    layer(LineLayer, { data: d.期货.卖.盘口, color: 卖颜色, 临时参数: '变成负数' }),
                    layer(LineLayer, { data: d.期货.买.净盘口, color: BTC颜色 }),
                    layer(LineLayer, { data: d.期货.买.净盘口_均线5, color: ETH颜色 }),
                ]
            },
            {
                layerList: [
                    layer(ZeroLayer, { color: 0xaaaaaa }),
                    layer(LineLayer, { data: d.期货.净成交量abs_macd.DIF, color: 买颜色1 }),
                    layer(LineLayer, { data: d.期货.净成交量abs_macd.DEM, color: 买颜色 }),
                ]
            },
            {
                layerList: [
                    layer(信号Layer, { data: d.期货.信号_摸顶, color: 卖颜色 }),
                    layer(TextLayer, {
                        text:
                            `上涨摸顶                    `,
                        color: ETH颜色,
                    })
                ]
            },
            {
                layerList: [
                    layer(信号Layer, { data: d.期货.信号_摸顶_下跌平仓, color: 卖颜色 }),
                    layer(TextLayer, {
                        text:
                            `信号_摸顶_下跌平仓新                    `,
                        color: ETH颜色,
                    })
                ]
            },
        ]
    }),
    复盘追涨追跌: (d, d2) => ({
        heightList: [0.4, 0.4, 0.1, 0.1],
        items: [
            [
                {
                    layerList: [
                        layer(LineLayer, { data: d2.XBTUSD.hopex.价格, color: ETH颜色 }),
                    ]
                },
               
               

                {

                    numberColor: 波动率颜色,
                    numberX: 100,
                    layerList: [
                        layer(ZeroLayer, { color: 波动率颜色 }),
                        layer(LineLayer, { data: d.期货.买.净成交量_累加60, color: 波动率颜色 }),
                    ]
                },
                // {
                //     numberColor: 石青,
                //     numberX: 100,
                //     layerList: [
                //         layer(LineLayer, { data: d.期货.价格_波动率30, color: 石青 }),
                //     ]
                // },
                {
                    numberColor: BTC颜色,
                    layerList: [
                        layer(LineLayer, { data: d2.XBTUSD.期货.价格, color: BTC颜色 }),

                        layer(TextLayer, {
                            text:
                                `hopex:${lastNumber(d2.XBTUSD.hopex.价格).toFixed(2)}  ` +
                                `bitmex:${lastNumber(d.期货.价格).toFixed(2)}      ` +
                                `期货30秒内成交量:${d.期货30秒内成交量().toFixed(2)}万   ` +
                                `期货波动率:${lastNumber(d.期货.价格_波动率30).toFixed(2)}`,
                            color: d === d2.XBTUSD ? BTC颜色 : ETH颜色,
                        })

                    ]
                },
              
            ],

            {
                layerList: [
                    layer(ZeroLayer, { color: 0xaaaaaa }),
                    layer(LineLayer, { data: d.期货.买.盘口, color: 买颜色 }),
                    layer(LineLayer, { data: d.期货.卖.盘口, color: 卖颜色, 临时参数: '变成负数' }),
                    layer(LineLayer, { data: d.期货.买.净盘口, color: BTC颜色 }),
                    layer(LineLayer, { data: d.期货.买.净盘口_均线5, color: ETH颜色 }),
                ]
            },
            {
                layerList: [
                    layer(信号Layer, { data: d.期货.信号_追涨, color: 买颜色 }),
                    layer(TextLayer, {
                        text:
                            `信号_追涨                    `,
                        color: ETH颜色,
                    })
                ]
            },
            {
                layerList: [
                    layer(信号Layer, { data: d.期货.信号_追跌, color: 卖颜色 }),
                    layer(TextLayer, {
                        text:
                            `信号_追跌                    `,
                        color: ETH颜色,
                    })
                ]
            },
        ]
    }),
    复盘下跌: (d, d2) => ({
        heightList: [0.4, 0.15, 0.15, 0.15,0.15],
        items: [
            [
                {
                    layerList: [
                        layer(LineLayer, { data: d2.XBTUSD.hopex.价格, color: ETH颜色 }),
                    ]
                },
                {
                    numberColor: 波动率颜色,
                    numberX: 100,
                    layerList: [
                        layer(ZeroLayer, { color: 波动率颜色 }),
                        layer(LineLayer, { data: d.期货.买.净成交量_累加60, color: 波动率颜色 }),
                    ]
                },
                {
                    numberColor: 石青,
                    numberX: 100,
                    layerList: [
                        layer(LineLayer, { data: d.期货.价格_波动率30, color: 石青 }),

                    ]
                },
                {
                    numberColor: BTC颜色,
                    layerList: [
                        layer(LineLayer, { data: d2.XBTUSD.期货.价格, color: BTC颜色 }),
                        layer(TextLayer, {
                            text:
                                `hopex:${lastNumber(d2.XBTUSD.hopex.价格).toFixed(2)}  ` +
                                `bitmex:${lastNumber(d.期货.价格).toFixed(2)}      ` +
                                `期货30秒内成交量:${d.期货30秒内成交量().toFixed(2)}万   ` +
                                `期货波动率:${lastNumber(d.期货.价格_波动率30).toFixed(2)}`,
                            color: d === d2.XBTUSD ? BTC颜色 : ETH颜色,
                        })
                    ]
                },
            ],



            {
                layerList: [
                    layer(ZeroLayer, { color: 0xaaaaaa }),
                    layer(LineLayer, { data: d.期货.买.盘口, color: 买颜色 }),
                    layer(LineLayer, { data: d.期货.卖.盘口, color: 卖颜色, 临时参数: '变成负数' }),
                    layer(LineLayer, { data: d.期货.买.净盘口, color: BTC颜色 }),
                    layer(LineLayer, { data: d.期货.买.净盘口_均线5, color: ETH颜色 }),
                ]
            },
            {
                layerList: [
                    layer(ZeroLayer, { color: 0xaaaaaa }),
                    layer(LineLayer, { data: d.期货.净成交量abs_macd.DIF, color: 卖颜色1 }),
                    layer(LineLayer, { data: d.期货.净成交量abs_macd.DEM, color: 卖颜色 }),
                ]
            },
            {
                layerList: [
                    layer(信号Layer, { data: d.期货.信号_抄底, color: 买颜色 }),
                    layer(TextLayer, {
                        text:
                            `下跌抄底                    `,
                        color: ETH颜色,
                    })
                ]
            },
            {
                layerList: [
                    layer(信号Layer, { data: d.期货.信号_抄底_上涨平仓, color: 买颜色 }),
                    layer(TextLayer, {
                        text:
                            `信号_抄底_上涨平仓新                    `,
                        color: ETH颜色,
                    })
                ]
            },

        ]
    }),

    实盘: (d, d2) => ({
        heightList: [0.5, 0.15, 0.1, 0.15, 0.1],
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
                        layer(LineLayer, { data: d2.XBTUSD.期货.价格, color: BTC颜色 }),
                        layer(TextLayer, {
                            text:
                                `hopex:${lastNumber(d2.XBTUSD.hopex.价格).toFixed(2)}  ` +
                                `bitmex:${lastNumber(d.期货.价格).toFixed(2)}      ` +
                                `期货30秒内成交量:${d.期货30秒内成交量().toFixed(2)}万   ` +
                                `期货波动率:${lastNumber(d.期货.价格_波动率30).toFixed(2)}`,
                            color: d === d2.XBTUSD ? BTC颜色 : ETH颜色,
                        })
                    ]
                },
                {
                    numberColor: 石青,
                    numberX: 100,
                    layerList: [
                        layer(LineLayer, { data: d.期货.价格_波动率30, color: 石青 }),
                    ]
                },
                {
                    numberColor: 波动率颜色,
                    numberX: 100,
                    layerList: [
                        layer(ZeroLayer, { color: 波动率颜色 }),
                        layer(LineLayer, { data: d.期货.买.净成交量_累加60, color: 波动率颜色 }),
                    ]
                },
            ],
            {
                layerList: [
                    layer(信号Layer, { data: d.期货.信号_摸顶, color: 卖颜色 }),
                    layer(TextLayer, {
                        text:
                            `上涨摸顶                    `,
                        color: ETH颜色,
                    })
                ]
            },
            {
                layerList: [
                    layer(信号Layer, { data: d.期货.信号_追涨, color: 买颜色 }),
                    layer(TextLayer, {
                        text:
                            `上涨追涨                    `,
                        color: ETH颜色,
                    })
                ]
            },

            {
                layerList: [
                    layer(信号Layer, { data: d.期货.信号_抄底, color: 买颜色 }),
                    layer(TextLayer, {
                        text:
                            `下跌抄底                    `,
                        color: ETH颜色,
                    })
                ]
            },
            {
                layerList: [
                    layer(信号Layer, { data: d.期货.信号_追跌, color: 卖颜色 }),
                    layer(TextLayer, {
                        text:
                            `下跌追跌                    `,
                        color: ETH颜色,
                    })
                ]
            },

        ]
    }),


    实盘hopex: (d, d2) => ({
        heightList: [0.5, 0.15, 0.1, 0.15, 0.1],
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
                        layer(LineLayer, { data: d2.XBTUSD.期货.价格, color: BTC颜色 }),
                        layer(TextLayer, {
                            text:
                                `hopex:${lastNumber(d2.XBTUSD.hopex.价格).toFixed(2)}  ` +
                                `bitmex:${lastNumber(d.期货.价格).toFixed(2)}      ` +
                                `期货30秒内成交量:${d.期货30秒内成交量().toFixed(2)}万   ` +
                                `期货波动率:${lastNumber(d.期货.价格_波动率30).toFixed(2)}`,
                            color: d === d2.XBTUSD ? BTC颜色 : ETH颜色,
                        })
                    ]
                },
                {
                    numberColor: 石青,
                    numberX: 100,
                    layerList: [
                        layer(LineLayer, { data: d.期货.价格_波动率30, color: 石青 }),
                    ]
                }],
            {
                layerList: [
                    layer(信号Layer, { data: d.期货.信号_摸顶, color: 卖颜色 }),
                    layer(TextLayer, {
                        text:
                            `上涨摸顶                    `,
                        color: ETH颜色,
                    })
                ]
            },
            {
                layerList: [
                    layer(信号Layer, { data: d.期货.信号_抄底, color: 买颜色 }),
                    layer(TextLayer, {
                        text:
                            `下跌抄底                    `,
                        color: ETH颜色,
                    })
                ]
            },
            {
                layerList: [
                    layer(信号Layer, { data: d2.XBTUSD.信号hopex_上涨, color: 买颜色 }),
                    layer(TextLayer, {
                        text:
                            `信号hopex_上涨                    `,
                        color: ETH颜色,
                    })
                ]
            },
            {
                layerList: [
                    layer(信号Layer, { data: d2.XBTUSD.信号hopex_下跌, color: 卖颜色 }),
                    layer(TextLayer, {
                        text:
                            `信号hopex_下跌                    `,
                        color: ETH颜色,
                    })
                ]
            },

        ]
    }),

    复盘下跌动力: (d, d2) => ({
        heightList: [0.4, 0.3, 0.3],
        items: [
            [{
                numberColor: BTC颜色,
                layerList: [
                    layer(LineLayer, { data: d2.XBTUSD.期货.价格, color: BTC颜色 }),
                    //layer(LineLayer, { data: d2.XBTUSD.期货.最低价10, color: 波动率颜色 }),
                    // layer(LineLayer, { data: d2.XBTUSD.期货.价格均线60, color: 0xffffff }),
                ]
            },

            // {
            //     numberColor: 波动率颜色,
            //     numberX: 100,
            //     layerList: [
            //         layer(ZeroLayer, { color: ETH颜色 }),
            //         layer(LineLayer, { data: d.期货.净成交量60, color: ETH颜色 }),
            //     ]
            // },
            // {
            //     numberColor: 卖颜色,
            //     layerList: [
            //         layer(ZeroLayer, { color: 卖颜色 }),
            //         layer(LineLayer, { data: d.期货.价格差_除以时间, color: 卖颜色 }),
            //     ]
            // },


            // {
            //     layerList: [
            //         layer(LineLayer, { data: d2.XBTUSD.期货.波动率, color: 石青 }),
            //     ]
            // },
            {
                numberColor: 买颜色,
                layerList: [
                    layer(ZeroLayer, { color: 买颜色 }),
                    layer(LineLayer, { data: d.期货.震荡指数, color: 买颜色 }),
                ]
            },
                // {
                //     layerList: [
                //         layer(LineLayer, { data: d2.XBTUSD.期货.阻力3跌, color: 波动率颜色 }),
                //     ]
                // },
            ],
            [
                // {
                //     numberColor: BTC颜色,
                //     layerList: [
                //         layer(LineLayer, { data: d2.XBTUSD.期货.成交量买均线5, color: 买颜色 }),
                //         layer(LineLayer, { data: d2.XBTUSD.期货.成交量卖均线5, color: 卖颜色 }),
                //     ]
                // },

                // {
                //     numberColor: BTC颜色,
                //     layerList: [
                //         layer(LineLayer, { data: d2.XBTUSD.期货.下跌.累计成交量, color: ETH颜色 }),
                //     ]
                // },
                {
                    numberColor: BTC颜色,
                    layerList: [
                        layer(LineLayer, { data: d2.XBTUSD.期货.下跌.价差, color: 波动率颜色 }),
                        layer(LineLayer, { data: d2.XBTUSD.期货.价格_波动率30, color: 石青 }),
                    ]
                },
                // {
                //     layerList: [
                //         layer(LineLayer, { data: d2.XBTUSD.期货.波动率, color: 石青 }),
                //     ]
                // },
                {
                    numberColor: 买颜色,
                    layerList: [
                        layer(ZeroLayer, { color: 买颜色 }),
                        layer(LineLayer, { data: d.期货.震荡指数_macd.DIF, color: 买颜色1 }),
                        layer(LineLayer, { data: d.期货.震荡指数_macd.DEM, color: 买颜色 }),
                    ]
                },


            ],
            [
                {
                    numberColor: BTC颜色,
                    yCoordinate: '对数',
                    layerList: [
                        layer(LineLayer, { data: d2.XBTUSD.期货.下跌.动力, color: ETH颜色 }),
                    ]
                },

            ]

        ]
    }),
    复盘上涨动力: (d, d2) => ({
        heightList: [0.4, 0.3, 0.3],
        items: [
            [{
                numberColor: BTC颜色,
                layerList: [
                    layer(LineLayer, { data: d2.XBTUSD.期货.价格, color: BTC颜色 }),
                    // layer(LineLayer, { data: d2.XBTUSD.期货.最高价10, color: 波动率颜色 }),
                    // layer(LineLayer, { data: d2.XBTUSD.期货.价格均线60, color: 0xffffff }),
                ]
            },

            {
                numberColor: 波动率颜色,
                numberX: 100,
                layerList: [
                    layer(ZeroLayer, { color: ETH颜色 }),
                    layer(LineLayer, { data: d.期货.买.净成交量_累加60, color: ETH颜色 }),
                ]
            },

            {
                numberColor: 买颜色,
                layerList: [
                    layer(ZeroLayer, { color: 买颜色 }),
                    layer(LineLayer, { data: d.期货.价格差_除以时间, color: 买颜色 }),
                ]
            },
           


            ],
            [
               
                {
                    numberColor: BTC颜色,
                    layerList: [
                        layer(LineLayer, { data: d2.XBTUSD.期货.上涨.价差, color: 波动率颜色 }),
                    ]
                },
              


            ],
            [
               

                {
                    numberColor: BTC颜色,
                    yCoordinate: '对数',
                    layerList: [
                        layer(LineLayer, { data: d2.XBTUSD.期货.上涨.动力, color: ETH颜色 }),
                    ]
                },

            ]

        ]
    }),
    大波动专用: (d, d2) => ({
        heightList: [0.6, 0.4],
        items: [
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
                        layer(LineLayer, { data: d.期货.买.净成交量_累加60, color: 波动率颜色 }),
                    ]
                },
                {
                    numberColor: 石青,
                    numberX: 100,
                    layerList: [
                        layer(LineLayer, { data: d.期货.价格_波动率30, color: 石青 }),
                    ]
                },
                {
                    numberColor: BTC颜色,
                    layerList: [
                        layer(LineLayer, { data: d2.XBTUSD.期货.价格, color: BTC颜色 }),

                        layer(TextLayer, {
                            text:
                                `hopex:${lastNumber(d2.XBTUSD.hopex.价格).toFixed(2)}  ` +
                                `bitmex:${lastNumber(d.期货.价格).toFixed(2)}      ` +
                                `期货30秒内成交量:${d.期货30秒内成交量().toFixed(2)}万   ` +
                                `期货波动率:${lastNumber(d.期货.价格_波动率30).toFixed(2)}`,
                            color: d === d2.XBTUSD ? BTC颜色 : ETH颜色,
                        })

                    ]
                },
            ],


            {
                layerList: [
                    layer(ZeroLayer, { color: 0xaaaaaa }),
                    layer(LineLayer, { data: d.期货.买.盘口, color: 买颜色 }),
                    layer(LineLayer, { data: d.期货.卖.盘口, color: 卖颜色, 临时参数: '变成负数' }),
                    layer(LineLayer, { data: d.期货.买.净盘口, color: BTC颜色 }),
                    layer(LineLayer, { data: d.期货.买.净盘口_均线5, color: ETH颜色 }),
                ]
            },
        ]
    }),
    测试盘口上涨: (d, d2) => ({
        heightList: [0.7, 0.3],
        items: [
            [
                {
                    layerList: [
                        layer(LineLayer, { data:  d2.XBTUSD.hopex.价格, color: ETH颜色 }),
                    ]
                },
                {
                    numberColor: BTC颜色,
                    layerList: [
                        layer(LineLayer, { data: d2.XBTUSD.期货.价格, color: BTC颜色 }),
                        layer(TextLayer, {
                            text:
                                `hopex:${lastNumber(d2.XBTUSD.hopex.价格).toFixed(2)}  ` +
                                `bitmex:${lastNumber(d.期货.价格).toFixed(2)}      ` +
                                `期货30秒内成交量:${d.期货30秒内成交量().toFixed(2)}万   ` +
                                `期货波动率:${lastNumber(d.期货.价格_波动率30).toFixed(2)}`,
                            color: d === d2.XBTUSD ? BTC颜色 : ETH颜色,
                        })

                    ]
                },
                // {
                //     layerList: [
                //         layer(ZeroLayer, { color: 买颜色 }),
                //         layer(LineLayer, { data:  d.期货.bitmex_hopex_上涨相对差价macd.DIF, color: 买颜色1 }),
                //         layer(LineLayer, { data: d.期货.bitmex_hopex_上涨相对差价macd.DEM, color: 买颜色 }),
                //     ]
                // },
                
            ],
            {
                layerList: [
                    layer(ZeroLayer, { color: 0xaaaaaa }),
                    layer(LineLayer, { data: d.期货.bitmex_hopex_上涨相对差价均线, color: 买颜色 }),
                    layer(LineLayer, { data: d.期货.bitmex_hopex_上涨相对价差, color: 买颜色1 }),
                ]
            },
            // {
            //     layerList: [
            //         layer(信号Layer, { data: d.期货.信号_摸顶, color: 卖颜色 }),
            //     ]
            // },
        ]
    }),
    测试盘口下跌: (d, d2) => ({
        heightList: [0.7, 0.3],
        items: [
            [
                {
                    layerList: [
                        layer(LineLayer, { data:  d2.XBTUSD.hopex.价格, color: ETH颜色 }),
                    ]
                },
                {
                    numberColor: BTC颜色,
                    layerList: [
                        layer(LineLayer, { data: d2.XBTUSD.期货.价格, color: BTC颜色 }),

                        layer(TextLayer, {
                            text:
                                `hopex:${lastNumber(d2.XBTUSD.hopex.价格).toFixed(2)}  ` +
                                `bitmex:${lastNumber(d.期货.价格).toFixed(2)}      ` +
                                `期货30秒内成交量:${d.期货30秒内成交量().toFixed(2)}万   ` +
                                `期货波动率:${lastNumber(d.期货.价格_波动率30).toFixed(2)}`,
                            color: d === d2.XBTUSD ? BTC颜色 : ETH颜色,
                        })

                    ]
                },
                // {
                //     layerList: [
                //         layer(ZeroLayer, { color: 卖颜色 }),
                //         layer(LineLayer, { data:  d.期货.bitmex_hopex_下跌相对差价macd.DIF, color: 卖颜色1 }),
                //         layer(LineLayer, { data: d.期货.bitmex_hopex_下跌相对差价macd.DEM, color: 卖颜色 }),
                //     ]
                // },
            ],
            {
                layerList: [
                    layer(ZeroLayer, { color: 0xaaaaaa }),
                    layer(LineLayer, { data: d.期货.bitmex_hopex_下跌相对价差均线, color: 卖颜色 }),
                    layer(LineLayer, { data: d.期货.bitmex_hopex_下跌相对价差, color: 卖颜色1 }),
                ]
            },
        ]
    }),

    上涨成交量与价差: (d, d2) => ({
        heightList: [0.4, 0.6],
        items: [
            [
                {
                    numberColor: BTC颜色,
                    layerList: [
                        layer(LineLayer, { data: d2.XBTUSD.期货.价格, color: BTC颜色 }),
                        layer(TextLayer, {
                            text:
                                `hopex:${lastNumber(d2.XBTUSD.hopex.价格).toFixed(2)}  ` +
                                `bitmex:${lastNumber(d.期货.价格).toFixed(2)}      ` +
                                `期货30秒内成交量:${d.期货30秒内成交量().toFixed(2)}万   ` +
                                `期货波动率:${lastNumber(d.期货.价格_波动率30).toFixed(2)}`,
                            color: d === d2.XBTUSD ? BTC颜色 : ETH颜色,
                        })

                    ]
                },
            ],
            [
                {
                    layerList: [
                        layer(LineLayer, { data: d.期货.上涨.价差, color: 波动率颜色 }),
                    ]
                    
                },
                {
                    layerList: [
                        layer(LineLayer, { data: d.期货.上涨.累计成交量, color: ETH颜色 }),
                    ]
                    
                },
            ]
        ]
    }),
    下跌成交量与价差: (d, d2) => ({
        heightList: [0.3, 0.7],
        items: [
            [
                {
                    numberColor: BTC颜色,
                    layerList: [
                        layer(LineLayer, { data: d2.XBTUSD.期货.价格, color: BTC颜色 }),
                        layer(TextLayer, {
                            text:
                                `hopex:${lastNumber(d2.XBTUSD.hopex.价格).toFixed(2)}  ` +
                                `bitmex:${lastNumber(d.期货.价格).toFixed(2)}      ` +
                                `期货30秒内成交量:${d.期货30秒内成交量().toFixed(2)}万   ` +
                                `期货波动率:${lastNumber(d.期货.价格_波动率30).toFixed(2)}`,
                            color: d === d2.XBTUSD ? BTC颜色 : ETH颜色,
                        })

                    ]
                },
            ],
            [
                // {   numberColor: 波动率颜色,
                //     layerList: [
                //         layer(LineLayer, { data: d.期货.下跌.价差, color: 波动率颜色 }),
                //     ]
                    
                // },
                // {numberColor: ETH颜色,
                //     layerList: [
                //         layer(LineLayer, { data: d.期货.下跌.累计成交量, color: ETH颜色 }),
                //     ]
                    
                // },
                {   numberColor: BTC颜色,
                    layerList: [
                        layer(LineLayer, { data: d.期货.下跌.动力, color: BTC颜色 }),
                    ]
                    
                },
                {   numberColor: 石青,
                    layerList: [
                        layer(LineLayer, { data: d.期货.下跌_动力波动率, color: 石青 }),
                    ]
                    
                },
            ]
        ]
    }),
    两种成交量macd: (d, d2) => ({
        heightList: [0.4,0.3, 0.3],
        items: [
            [
                {
                    numberColor: BTC颜色,
                    layerList: [
                        layer(LineLayer, { data: d2.XBTUSD.期货.价格, color: BTC颜色 }),
                        layer(TextLayer, {
                            text:
                                `hopex:${lastNumber(d2.XBTUSD.hopex.价格).toFixed(2)}  ` +
                                `bitmex:${lastNumber(d.期货.价格).toFixed(2)}      ` +
                                `期货30秒内成交量:${d.期货30秒内成交量().toFixed(2)}万   ` +
                                `期货波动率:${lastNumber(d.期货.价格_波动率30).toFixed(2)}`,
                            color: d === d2.XBTUSD ? BTC颜色 : ETH颜色,
                        })

                    ]
                },
            ],
            [
                {
                    layerList: [
                        layer(LineLayer, { data: d.期货.净成交量abs_macd.DIF, color: 买颜色1 }),
                        layer(LineLayer, { data: d.期货.净成交量abs_macd.DEM, color: 买颜色 }),
                    ]
                    
                },
               
                
            ],
            {
                layerList: [
                    layer(LineLayer, { data: d.期货.净成交量abs_macd.DIF, color: 卖颜色1 }),
                    layer(LineLayer, { data: d.期货.净成交量abs_macd.DEM, color: 卖颜色 }),
                ]
                
            },
        ]
    }),




    原始数据: (d, d2) => ({
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
                        layer(LineLayer, { data: d2.XBTUSD.期货.价格, color: BTC颜色 }),
                    ]
                },
                {
                    numberColor: 波动率颜色,
                    numberX: 100,
                    layerList: [
                        layer(ZeroLayer, { color: 波动率颜色 }),
                        layer(LineLayer, { data: d.期货.买.净成交量_累加60, color: 波动率颜色 }),
                    ]
                },
               


            ],
          
            {
                layerList: [
                    layer(ZeroLayer, { color: 0xaaaaaa }),
                    layer(LineLayer, { data: d.期货.买.成交量, color: 买颜色 }),
                    layer(LineLayer, { data: d.期货.卖.成交量, color: 卖颜色, 临时参数: '变成负数' }),
                    //layer(LineLayer, { data: d.期货.买.净成交量_累加5, color: ETH颜色 }),
                    layer(LineLayer, { data: d.期货.卖.净成交量_累加5, color: ETH颜色 }),
                    layer(TextLayer, { text: '成交量买 成交量卖      ', color: 0xffff00 })
                ]
            },
            {
                layerList: [
                    layer(LineLayer, { data: d.期货.买.盘口, color: 买颜色 }),
                    layer(LineLayer, { data: d.期货.卖.盘口, color: 卖颜色 }),
                    layer(TextLayer, { text: '盘口买 盘口卖      ', color: 0xffff00 })
                ]
            },
        ]
    }),
}