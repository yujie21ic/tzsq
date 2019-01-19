import { to价格对齐 } from './to价格对齐'
import { expect } from 'chai'
import 'mocha'

const buyTest = (a: number, grid: number, b: number) =>
    it('Buy Test', () =>
        expect(to价格对齐({ grid, side: 'Buy', value: a, })).to.be.equal(b)
    )

const sellTest = (a: number, grid: number, b: number) =>
    it('Sell Test', () =>
        expect(to价格对齐({ grid, side: 'Sell', value: a, })).to.be.equal(b)
    )

describe('to价格对齐', () => {

    buyTest(3500, 0.5, 3500)
    buyTest(3500.3, 0.5, 3500)
    buyTest(3500.5, 0.5, 3500.5)
    buyTest(3500.7, 0.5, 3500.5)
    buyTest(3500.9, 0.5, 3500.5)


    buyTest(3500, 0.2, 3500)
    buyTest(3500.3, 0.2, 3500.2)
    buyTest(3500.5, 0.2, 3500.4)
    buyTest(3500.7, 0.2, 3500.6)
    buyTest(3500.9, 0.2, 3500.8)

    sellTest(3500, 0.2, 3500)
    sellTest(3500.3, 0.2, 3500.4)
    sellTest(3500.5, 0.2, 3500.6)
    sellTest(3500.7, 0.2, 3500.8)
    sellTest(3500.9, 0.2, 3501)
})