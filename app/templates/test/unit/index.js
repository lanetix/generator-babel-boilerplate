import handler from '../../src/handler';

describe('Event <%= event %>', () => {
  describe('Handler function', () => {
    beforeEach(() => {
      spy(handler);
      handler();
    });

    it('should have been run once', () => {
      expect(handler).to.have.been.calledOnce;
    });
  });
});
