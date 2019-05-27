import { hello } from './hello'
import { expect } from 'chai'
import 'mocha'

describe('hello', () => {
    it('should return Hello World!', () => {
        const result = hello()
        expect(result).to.equal('Hello World!')
    })
})
