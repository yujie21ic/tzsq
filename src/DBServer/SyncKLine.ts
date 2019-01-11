import * as Sequelize from 'sequelize'
import { BaseType } from '../lib/BaseType'
import { Sampling } from '../lib/C/Sampling'


type SyncKLineFunc = {
    getTable: () => Sequelize.Model<BaseType.KLine, BaseType.KLine>
    get采集start: (lastItemID: number) => Promise<number>
    getData: (start: number) => Promise<{
        tickArr: BaseType.KLine[];
        newStart: number;
    }>
}

export class SyncKLine {

    private sampling = new Sampling<BaseType.KLine>({
        open: '开',
        high: '高',
        low: '低',
        close: '收',
        buySize: '累加',
        sellSize: '累加',
        buyCount: '累加',
        sellCount: '累加',
    })

    private syncKLineFunc: SyncKLineFunc

    constructor(syncKLineFunc: SyncKLineFunc) {
        this.syncKLineFunc = syncKLineFunc
        this.sync()
    }

    private async init(table: Sequelize.Model<BaseType.KLine, BaseType.KLine>) {
        let firstItem = true
        this.sampling.onComplete = async item => {
            //lastItem !== undefined 重复
            //lastItem === undefined 第一个数据不完整 不要
            if (firstItem) {
                firstItem = false
                return
            }
            // await sequelize.transaction(t => table.create(item, { transaction: t }))
            await table.create(item)
        }

        //创建表
        await table.sync()

        //
        const lastItem = await table.findOne({
            raw: true,
            order: [['id', 'desc']],
        })

        if (lastItem) {
            await this.sampling.in(lastItem)
            return lastItem.id
        }

        return NaN
    }

    private async sync() {
        let start = await this.syncKLineFunc.get采集start(await this.init(this.syncKLineFunc.getTable()))
        while (true) {
            const { tickArr, newStart } = await this.syncKLineFunc.getData(start)
            tickArr.forEach(v => this.sampling.in(v))
            start = newStart
        }
    }
}