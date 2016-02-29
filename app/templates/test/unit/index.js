/* eslint-env mocha */
import handler from '../../src/<%= recordType %>.<%= event %>'

describe('<%= recordType %>', () => {
  describe('.on("<%= event %>")', () => {
    beforeEach(() => {
      global.spy(handler)
      handler()
    })

    it('should have been run once', () => {
      global.expect(handler).to.have.been.calledOnce
    })
  })
})
