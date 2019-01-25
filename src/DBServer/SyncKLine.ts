import * as Sequelize from 'sequelize'
import { BaseType } from '../lib/BaseType'
import { Sampling } from '../lib/C/Sampling'
import { sleep } from '../lib/C/sleep'


type SyncKLineFunc = {
    getName: () => string
    getTable: () => Sequelize.Model<BaseType.KLine, BaseType.KLine>
    get采集start: (lastItemID: number) => Promise<number>
    getData: (start: number) => Promise<{
        tickArr: BaseType.KLine[];
        newStart: number;
    }>
}

export class SyncKLine {

    private sampling?: Sampling<BaseType.KLine>

    private syncKLineFunc: SyncKLineFunc

    constructor(syncKLineFunc: SyncKLineFunc) {
        this.syncKLineFunc = syncKLineFunc
        this.sync()
    }

    private async init(table: Sequelize.Model<BaseType.KLine, BaseType.KLine>) {
        let firstItem = true
        this.sampling = new Sampling<BaseType.KLine>({
            open: '开',
            high: '高',
            low: '低',
            close: '收',
            buySize: '累加',
            sellSize: '累加',
            buyCount: '累加',
            sellCount: '累加',
        })
        this.sampling.onComplete = async item => {
            //lastItem !== undefined 重复
            //lastItem === undefined 第一个数据不完整 不要
            if (firstItem) {
                firstItem = false
                return
            }
            await table.create(item)
        }

        //创建表
        await table.sync()

        //
        const lastItem = await table.findOne<{}>({
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

        while (true) {
            try {
                let start = await this.syncKLineFunc.get采集start(await this.init(this.syncKLineFunc.getTable()))
                while (true) {
                    const { tickArr, newStart } = await this.syncKLineFunc.getData(start)
                    for (let i = 0; i < tickArr.length; i++) {
                        await this.sampling!.in(tickArr[i])
                    }
                    start = newStart
                }
            } catch (error) {
                console.log(`SyncKLine ${this.syncKLineFunc.getName()} 出错  重来  error:${error}`)
                await sleep(1000)
            }
        }


    }



}