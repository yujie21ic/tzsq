import { RealDataBase } from './RealDataServer/RealDataBase'
import { layer, LayerItem } from './Chart'
import { LineLayer } from './Chart/Layer/LineLayer'
import { TextLayer, LeftTextLayer } from './Chart/Layer/TextLayer'
import { lastNumber } from './F/lastNumber'
import { ZeroLayer } from './Chart/Layer/ZeroLayer' 



// type D = RealDataBase['dataExt']['XBTUSD']
type D2 = RealDataBase['dataExt']

type ItemFunc = (d: '废弃', d2: D2) => {
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
//const 以太坊颜色 = 0x6d3939
const LTC颜色 = 0x6d3939
//const bitmexETH颜色 = 0x508200
//const 黑色 = 0x000000


export const Tick行情____config: { [key in string]: ItemFunc } = {

    实盘手动: (d, d2) => ({
        heightList: [0.2, 0.8],
        items: [
            {
                layerList: [
                    layer(ZeroLayer, { color: 0xaaaaaa }),
                    layer(LineLayer, { data: d2.bitmex.XBTUSD.买.盘口, color: 买颜色 }),
                    layer(LineLayer, { data: d2.bitmex.XBTUSD.卖.盘口, color: 卖颜色, 临时参数: '变成负数' }),
                    layer(LineLayer, { data: d2.bitmex.XBTUSD.买.净盘口_均线3, color: ETH颜色 }),
                    layer(TextLayer, {
                        text:
                            `买1  :${(lastNumber(d2.bitmex.XBTUSD.买.盘口1) / 10000).toFixed(2)}万  ` +
                            `卖1  :${(lastNumber(d2.bitmex.XBTUSD.卖.盘口1) / 10000).toFixed(2)}万   ` +
                            `期货波动率:${lastNumber(d2.bitmex.XBTUSD.价格_波动率30).toFixed(2)}`,
                        color: BTC颜色,
                    })
                ]
            },
            [
                {
                    numberColor: 0x000000,
                    layerList: [
                        layer(LineLayer, { data: d2.hopex.LTCUSDT.价格, color: LTC颜色 }),
                    ]
                },
                {
                    numberColor: 净成交量颜色,
                    numberX: 100,
                    layerList: [
                        layer(ZeroLayer, { color: ETH颜色 }),
                        layer(LineLayer, { data: d2.bitmex.XBTUSD.买.净成交量_累加60, color: 净成交量颜色 }),
                    ]
                },

                {
                    numberColor: 石青,
                    layerList: [
                        layer(LineLayer, { data: d2.binance.ethusdt.价格, color: 石青 }),
                    ]
                },


                {
                    numberColor: 0x000000,
                    layerList: [
                        layer(LineLayer, { data: d2.bitmex.XBTUSD.价格, color: BTC颜色 }),
                        layer(TextLayer, {
                            text:
                                `买1  :${(lastNumber(d2.bitmex.XBTUSD.买.盘口1) / 10000).toFixed(2)}万  ` +
                                `卖1  :${(lastNumber(d2.bitmex.XBTUSD.卖.盘口1) / 10000).toFixed(2)}万   `,
                            color: BTC颜色,
                        }),
                        layer(LeftTextLayer, {
                            text:
                                `hopex:${lastNumber(d2.hopex.BTCUSDT.价格).toFixed(2)}  ` +
                                `hopex:${lastNumber(d2.hopex.ETHUSDT.价格).toFixed(2)}  ` +
                                `bitmex:${lastNumber(d2.bitmex.XBTUSD.价格).toFixed(2)}      ` +
                                `期货30秒内成交量:${d2.期货30秒内成交量('XBTUSD').toFixed(2)}万   ` +
                                `期货波动率:${lastNumber(d2.bitmex.XBTUSD.价格_波动率30).toFixed(2)}`,
                            color: BTC颜色,
                        })
                    ]
                },
                {
                    numberColor: BTC颜色,
                    layerList: [
                        layer(LineLayer, { data: d2.binance.btcusdt.价格, color: ETH颜色 }),
                    ]
                },


            ],

        ]
    }),
    实盘手动deribit: (d, d2) => ({
        heightList: [0.2, 0.8],
        items: [
            {
                layerList: [
                    layer(ZeroLayer, { color: 0xaaaaaa }),
                    layer(LineLayer, { data: d2.bitmex.XBTUSD.买.盘口, color: 买颜色 }),
                    layer(LineLayer, { data: d2.bitmex.XBTUSD.卖.盘口, color: 卖颜色, 临时参数: '变成负数' }),
                    layer(LineLayer, { data: d2.bitmex.XBTUSD.买.净盘口_均线3, color: ETH颜色 }),
                    layer(TextLayer, {
                        text:
                            `买1  :${(lastNumber(d2.bitmex.XBTUSD.买.盘口1) / 10000).toFixed(2)}万  ` +
                            `卖1  :${(lastNumber(d2.bitmex.XBTUSD.卖.盘口1) / 10000).toFixed(2)}万   ` +
                            `期货波动率:${lastNumber(d2.bitmex.XBTUSD.价格_波动率30).toFixed(2)}`,
                        color: BTC颜色,
                    })
                ]
            },
            [

                {
                    numberColor: 净成交量颜色,
                    numberX: 100,
                    layerList: [
                        layer(ZeroLayer, { color: ETH颜色 }),
                        layer(LineLayer, { data: d2.bitmex.XBTUSD.买.净成交量_累加60, color: 净成交量颜色 }),
                    ]
                },

                {
                    numberColor: 石青,
                    layerList: [
                        layer(LineLayer, { data: d2.deribit.BTC_PERPETUAL.价格, color: 石青 }),
                    ]
                },


                {
                    numberColor: 0x000000,
                    layerList: [
                        layer(LineLayer, { data: d2.bitmex.XBTUSD.价格, color: BTC颜色 }),
                        layer(TextLayer, {
                            text:
                                `买1  :${(lastNumber(d2.bitmex.XBTUSD.买.盘口1) / 10000).toFixed(2)}万  ` +
                                `卖1  :${(lastNumber(d2.bitmex.XBTUSD.卖.盘口1) / 10000).toFixed(2)}万   `,
                            color: BTC颜色,
                        }),
                        layer(LeftTextLayer, {
                            text:
                                `hopex:${lastNumber(d2.hopex.BTCUSDT.价格).toFixed(2)}  ` +
                                `hopex:${lastNumber(d2.hopex.ETHUSDT.价格).toFixed(2)}  ` +
                                `bitmex:${lastNumber(d2.bitmex.XBTUSD.价格).toFixed(2)}      ` +
                                `期货30秒内成交量:${d2.期货30秒内成交量('XBTUSD').toFixed(2)}万   ` +
                                `期货波动率:${lastNumber(d2.bitmex.XBTUSD.价格_波动率30).toFixed(2)}`,
                            color: BTC颜色,
                        })
                    ]
                },
                {
                    numberColor: BTC颜色,
                    layerList: [
                        layer(LineLayer, { data: d2.hopex.BTCUSDT.价格, color: ETH颜色 }),
                    ]
                },


            ],

        ]
    }),
    实盘手动ETH: (d, d2) => ({
        heightList: [0.2, 0.8],
        items: [
            {
                layerList: [
                    layer(ZeroLayer, { color: 0xaaaaaa }),
                    layer(LineLayer, { data: d2.bitmex.ETHUSD.买.盘口, color: 买颜色 }),
                    layer(LineLayer, { data: d2.bitmex.ETHUSD.卖.盘口, color: 卖颜色, 临时参数: '变成负数' }),
                    //layer(LineLayer, { data: d.期货.买.净盘口, color: BTC颜色 }),
                    layer(LineLayer, { data: d2.bitmex.ETHUSD.买.净盘口_均线3, color: ETH颜色 }),
                    layer(TextLayer, {
                        text:
                            `买1  :${(lastNumber(d2.bitmex.ETHUSD.买.盘口1) / 10000).toFixed(2)}万  ` +
                            `卖1  :${(lastNumber(d2.bitmex.ETHUSD.卖.盘口1) / 10000).toFixed(2)}万   ` +
                            `期货波动率:${lastNumber(d2.bitmex.ETHUSD.价格_波动率30).toFixed(2)}`,
                        color: ETH颜色,
                    })
                ]
            },
            [

                {
                    numberColor: 石青,
                    layerList: [
                        layer(LineLayer, { data: d2.bitmex.ETHUSD.价格, color: 石青 }),
                    ]
                },
                // {
                //     numberColor: 净成交量颜色,
                //     numberX: 100,
                //     layerList: [
                //         layer(ZeroLayer, { color: ETH颜色 }),
                //         layer(LineLayer, { data: d.bitmex.买.净成交量_累加60, color: 净成交量颜色 }),
                //     ]
                // },



                {
                    numberColor: 0x000000,
                    layerList: [
                        layer(LineLayer, { data: d2.bitmex.XBTUSD.价格, color: BTC颜色 }),
                        layer(TextLayer, {
                            text:
                                `买1  :${(lastNumber(d2.bitmex.XBTUSD.买.盘口1) / 10000).toFixed(2)}万  ` +
                                `卖1  :${(lastNumber(d2.bitmex.XBTUSD.卖.盘口1) / 10000).toFixed(2)}万   `,
                            color: BTC颜色,
                        }),
                        layer(LeftTextLayer, {
                            text:
                                `hopex:${lastNumber(d2.hopex.BTCUSDT.价格).toFixed(2)}  ` +
                                `hopex:${lastNumber(d2.hopex.ETHUSDT.价格).toFixed(2)}  ` +
                                `bitmex:${lastNumber(d2.bitmex.XBTUSD.价格).toFixed(2)}      ` +
                                `期货30秒内成交量:${d2.期货30秒内成交量('XBTUSD').toFixed(2)}万   ` +
                                `期货波动率:${lastNumber(d2.bitmex.XBTUSD.价格_波动率30).toFixed(2)}`,
                            color: BTC颜色,
                        })
                    ]
                },
                {
                    numberColor: BTC颜色,
                    layerList: [
                        layer(LineLayer, { data: d2.hopex.BTCUSDT.价格, color: ETH颜色 }),
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
    // 实盘手动成交量: (d, d2) => ({
    //     heightList: [0.2, 0.8],
    //     items: [
    //         {
    //             layerList: [
    //                 layer(ZeroLayer, { color: 0xaaaaaa }),
    //                 layer(LineLayer, { data: d2.bitmex.XBTUSD.买.盘口, color: 买颜色 }),
    //                 layer(LineLayer, { data: d2.bitmex.XBTUSD.卖.盘口, color: 卖颜色, 临时参数: '变成负数' }), 
    //                 layer(LineLayer, { data: d2.bitmex.XBTUSD.买.净盘口_均线3, color: ETH颜色 }),
    //                 layer(TextLayer, {
    //                     text:
    //                         `买1  :${(lastNumber(d2.bitmex.XBTUSD.买.盘口1) / 10000).toFixed(2)}万  ` +
    //                         `卖1  :${(lastNumber(d2.bitmex.XBTUSD.卖.盘口1) / 10000).toFixed(2)}万   ` +
    //                         `期货波动率:${lastNumber(d2.bitmex.XBTUSD.价格_波动率30).toFixed(2)}`,
    //                     color: BTC颜色,
    //                 })
    //             ]
    //         },
    //         [
    //             {
    //                 numberColor: 0x000000,
    //                 layerList: [
    //                     layer(LineLayer, { data: d2.bitmex.XBTUSD.价格, color: 石青 }),
    //                 ]
    //             },
    //             {
    //                 numberColor: ETH颜色,
    //                 numberX: 100,
    //                 layerList: [
    //                     layer(ZeroLayer, { color: ETH颜色 }),
    //                     layer(LineLayer, { data: d.hopex_bitmex_相对差价, color: ETH颜色 }),
    //                 ]
    //             },
    //             {
    //                 numberX: 100,
    //                 layerList: [
    //                     layer(LineLayer, { data: d2.bitmex.XBTUSD.买.买成交量累加, color: 买颜色 }),
    //                     layer(LineLayer, { data: d2.bitmex.XBTUSD.买.卖成交量累加, color: 卖颜色 }),
    //                 ]
    //             }, 




    //             {
    //                 numberColor: 0x000000,
    //                 layerList: [
    //                     layer(LineLayer, { data: d2.bitmex.XBTUSD.价格, color: BTC颜色 }),
    //                     layer(TextLayer, {
    //                         text:
    //                             `买1  :${(lastNumber(d2.bitmex.XBTUSD.买.盘口1) / 10000).toFixed(2)}万  ` +
    //                             `卖1  :${(lastNumber(d2.bitmex.XBTUSD.卖.盘口1) / 10000).toFixed(2)}万   `,
    //                         color: BTC颜色,
    //                     }),
    //                     layer(LeftTextLayer, {
    //                         text:
    //                             `hopex:${lastNumber(d2.hopex.BTCUSDT.价格).toFixed(2)}  ` +
    //                             `hopex:${lastNumber(d2.hopex.ETHUSDT.价格).toFixed(2)}  ` +
    //                             `bitmex:${lastNumber(d2.bitmex.XBTUSD.价格).toFixed(2)}      ` +
    //                             `期货30秒内成交量:${d2.期货30秒内成交量('XBTUSD').toFixed(2)}万   ` +
    //                             `期货波动率:${lastNumber(d2.bitmex.XBTUSD.价格_波动率30).toFixed(2)}`,
    //                         color: BTC颜色,
    //                     })
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
                        layer(LineLayer, { data: d2.ctp.rb1910.买.净成交量_累加60, color: 波动率颜色 }),
                    ]
                },
                {
                    numberColor: BTC颜色,
                    layerList: [
                        layer(LineLayer, { data: d2.ctp.rb1910.价格, color: BTC颜色 }),
                    ]
                },
            ],
            {
                layerList: [
                    layer(ZeroLayer, { color: 0xaaaaaa }),
                    layer(LineLayer, { data: d2.ctp.rb1910.买.成交量, color: 买颜色 }),
                    layer(LineLayer, { data: d2.ctp.rb1910.卖.成交量, color: 卖颜色, 临时参数: '变成负数' }),
                    layer(TextLayer, { text: '成交量买 成交量卖      ', color: 0xffff00 })
                ]
            },
            {
                layerList: [
                    layer(LineLayer, { data: d2.ctp.rb1910.买.盘口, color: 买颜色 }),
                    layer(LineLayer, { data: d2.ctp.rb1910.卖.盘口, color: 卖颜色 }),
                    layer(TextLayer, { text: '盘口买 盘口卖      ', color: 0xffff00 })
                ]
            },
        ]
    }),
    // 双开,双平,多换,空换,多平,空平,空开,多开,
    '螺纹成交量1': (d, d2) => ({
        heightList: [1],
        items: [
            [
                {
                    layerList: [
                        layer(ZeroLayer, { color: 0xaaaaaa }),
                        layer(LineLayer, { data: d2.ctp.rb1910.买.买成交量累加, color: 买颜色 }),
                        layer(LineLayer, { data: d2.ctp.rb1910.买.卖成交量累加, color: 卖颜色 }),
                    ]
                },
                {
                    numberColor: BTC颜色,
                    layerList: [
                        layer(LineLayer, { data: d2.ctp.rb1910.价格, color: BTC颜色 }),
                    ]
                },

            ],

        ]
    }),

    'CTP_螺纹': (d, d2) => ({
        heightList: [0.2, 0.8],
        items: [
            {
                layerList: [
                    layer(ZeroLayer, { color: 0xaaaaaa }),
                    layer(LineLayer, { data: d2.ctp.rb1910.买.盘口1, color: 买颜色1, 临时参数: '变成负数' }),
                    layer(LineLayer, { data: d2.ctp.rb1910.买.净盘口_均线3, color: ETH颜色 }),
                    layer(LineLayer, { data: d2.ctp.rb1910.卖.盘口1, color: 卖颜色1 }),
                ]
            },
            [
                {
                    layerList: [
                        layer(LineLayer, { data: d2.ctp.rb1910.买.买成交量累加, color: 买颜色 }),
                        layer(LineLayer, { data: d2.ctp.rb1910.买.卖成交量累加, color: 卖颜色 }),
                    ]
                },
                {
                    layerList: [
                        layer(ZeroLayer, { color: ETH颜色 }),
                        layer(LineLayer, { data: d2.ctp.rb1910.买.净成交量_累加300, color: 净成交量颜色 }),
                    ]
                },

                {
                    numberColor: BTC颜色,
                    layerList: [
                        layer(LineLayer, { data: d2.ctp.rb1910.价格, color: BTC颜色 }),
                        layer(TextLayer, {
                            text:
                                `买1  :${(lastNumber(d2.ctp.rb1910.买.盘口1)).toFixed(2)}  ` +
                                `卖1  :${(lastNumber(d2.ctp.rb1910.卖.盘口1)).toFixed(2)}   `,
                            color: ETH颜色,
                        })
                    ]
                },

            ],

        ]
    }),
    'CTP_PTA': (d, d2) => ({
        heightList: [0.2, 0.8],
        items: [
            {
                layerList: [
                    layer(ZeroLayer, { color: 0xaaaaaa }),
                    layer(LineLayer, { data: d2.ctp.TA909.买.盘口1, color: 买颜色1, 临时参数: '变成负数' }),
                    layer(LineLayer, { data: d2.ctp.TA909.买.净盘口_均线3, color: ETH颜色 }),
                    layer(LineLayer, { data: d2.ctp.TA909.卖.盘口1, color: 卖颜色1 }),
                ]
            },
            [
                {
                    layerList: [
                        layer(LineLayer, { data: d2.ctp.TA909.买.买成交量累加, color: 买颜色 }),
                        layer(LineLayer, { data: d2.ctp.TA909.买.卖成交量累加, color: 卖颜色 }),
                    ]
                },
                {
                    layerList: [
                        layer(ZeroLayer, { color: 0xaaaaaa }),
                        layer(LineLayer, { data: d2.ctp.TA909.买.净成交量_累加300, color: 净成交量颜色 }),
                    ]
                },

                {
                    numberColor: BTC颜色,
                    layerList: [
                        layer(LineLayer, { data: d2.ctp.TA909.价格, color: BTC颜色 }),
                        layer(TextLayer, {
                            text:
                                `买1  :${(lastNumber(d2.ctp.TA909.买.盘口1)).toFixed(2)}  ` +
                                `卖1  :${(lastNumber(d2.ctp.TA909.卖.盘口1)).toFixed(2)}   `,
                            color: ETH颜色,
                        })
                    ]
                },

            ],

        ]
    }),
    'CTP_铁矿': (d, d2) => ({
        heightList: [0.2, 0.8],
        items: [
            {
                layerList: [
                    layer(ZeroLayer, { color: 0xaaaaaa }),
                    layer(LineLayer, { data: d2.ctp.i1909.买.盘口1, color: 买颜色1, 临时参数: '变成负数' }),
                    layer(LineLayer, { data: d2.ctp.i1909.买.净盘口_均线3, color: ETH颜色 }),
                    layer(LineLayer, { data: d2.ctp.i1909.卖.盘口1, color: 卖颜色1 }),
                ]
            },
            [
                {
                    layerList: [
                        layer(LineLayer, { data: d2.ctp.i1909.买.买成交量累加, color: 买颜色 }),
                        layer(LineLayer, { data: d2.ctp.i1909.买.卖成交量累加, color: 卖颜色 }),
                    ]
                },
                {
                    layerList: [
                        layer(ZeroLayer, { color: 0xaaaaaa }),
                        layer(LineLayer, { data: d2.ctp.i1909.买.净成交量_累加300, color: 净成交量颜色 }),
                    ]
                },

                {
                    numberColor: BTC颜色,
                    layerList: [
                        layer(LineLayer, { data: d2.ctp.i1909.价格, color: BTC颜色 }),
                        layer(TextLayer, {
                            text:
                                `买1  :${(lastNumber(d2.ctp.i1909.买.盘口1)).toFixed(2)}  ` +
                                `卖1  :${(lastNumber(d2.ctp.i1909.卖.盘口1)).toFixed(2)}   `,
                            color: ETH颜色,
                        })
                    ]
                },

            ],

        ]
    }),
    'CTP_郑醇': (d, d2) => ({
        heightList: [0.2, 0.8],
        items: [
            {
                layerList: [
                    layer(ZeroLayer, { color: 0xaaaaaa }),
                    layer(LineLayer, { data: d2.ctp.MA909.买.盘口1, color: 买颜色1, 临时参数: '变成负数' }),
                    layer(LineLayer, { data: d2.ctp.MA909.买.净盘口_均线3, color: ETH颜色 }),
                    layer(LineLayer, { data: d2.ctp.MA909.卖.盘口1, color: 卖颜色1 }),
                ]
            },
            [
                {
                    layerList: [
                        layer(LineLayer, { data: d2.ctp.MA909.买.买成交量累加, color: 买颜色 }),
                        layer(LineLayer, { data: d2.ctp.MA909.买.卖成交量累加, color: 卖颜色 }),
                    ]
                },
                {
                    layerList: [
                        layer(ZeroLayer, { color: 0xaaaaaa }),
                        layer(LineLayer, { data: d2.ctp.MA909.买.净成交量_累加300, color: 净成交量颜色 }),
                    ]
                },

                {
                    numberColor: BTC颜色,
                    layerList: [
                        layer(LineLayer, { data: d2.ctp.MA909.价格, color: BTC颜色 }),
                        layer(TextLayer, {
                            text:
                                `买1  :${(lastNumber(d2.ctp.MA909.买.盘口1)).toFixed(2)}  ` +
                                `卖1  :${(lastNumber(d2.ctp.MA909.卖.盘口1)).toFixed(2)}   `,
                            color: ETH颜色,
                        })
                    ]
                },

            ],

        ]
    }),
    'CTP_白糖': (d, d2) => ({
        heightList: [0.2, 0.8],
        items: [
            {
                layerList: [
                    layer(ZeroLayer, { color: 0xaaaaaa }),
                    layer(LineLayer, { data: d2.ctp.SR909.买.盘口1, color: 买颜色1, 临时参数: '变成负数' }),
                    layer(LineLayer, { data: d2.ctp.SR909.买.净盘口_均线3, color: ETH颜色 }),
                    layer(LineLayer, { data: d2.ctp.SR909.卖.盘口1, color: 卖颜色1 }),
                ]
            },
            [
                {
                    layerList: [
                        layer(LineLayer, { data: d2.ctp.SR909.买.买成交量累加, color: 买颜色 }),
                        layer(LineLayer, { data: d2.ctp.SR909.买.卖成交量累加, color: 卖颜色 }),
                    ]
                },
                {
                    layerList: [
                        layer(ZeroLayer, { color: 0xaaaaaa }),
                        layer(LineLayer, { data: d2.ctp.SR909.买.净成交量_累加300, color: 净成交量颜色 }),
                    ]
                },

                {
                    numberColor: BTC颜色,
                    layerList: [
                        layer(LineLayer, { data: d2.ctp.SR909.价格, color: BTC颜色 }),
                        layer(TextLayer, {
                            text:
                                `买1  :${(lastNumber(d2.ctp.SR909.买.盘口1)).toFixed(2)}  ` +
                                `卖1  :${(lastNumber(d2.ctp.SR909.卖.盘口1)).toFixed(2)}   `,
                            color: ETH颜色,
                        })
                    ]
                },

            ],

        ]
    }),
 


} 