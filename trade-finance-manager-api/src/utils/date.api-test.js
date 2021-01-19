const {
  formatYear,
} = require('../../src/utils/date');

describe('utils - date', () => {
  describe('formatYear', () => {
    describe('when year is only 2 digits', () => {
      it('should return 4 digit year', () => {
        const result = formatYear('01');
        expect(result).toEqual('2001');
      });
    });

    describe('when year already has 4 digits', () => {
      it('should return 4 digit year', () => {
        const result = formatYear('2001');
        expect(result).toEqual('2001');
      });
    });
  });
});
