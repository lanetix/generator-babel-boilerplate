import handler from '../../src/<%= recordType %>.<%= event %>'

describe('<%= recordType %>', () => {
  describe('.on("<%= event %>")', () => {
    beforeEach(() => {
      spy(handler)
      handler()
    })

    it('should have been run once', () => {
      expect(handler).to.have.been.calledOnce
    })
  })
})
