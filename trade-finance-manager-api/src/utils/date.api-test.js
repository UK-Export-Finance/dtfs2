const {
  formatYear,
  formatDate,
  formatTimestamp,
  convertDateToTimestamp,
} = require('./date');

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

  describe('formatDate', () => {
    it('should return a date in YYYY-MM-DD format', () => {
      const result = formatDate('20210419');
      expect(result).toEqual('2021-04-19');
    });
  });

  describe('formatTimestamp', () => {
    it('should return a date in YYYY-MM-DD format', () => {
      const result = formatTimestamp(1618842665642);
      expect(result).toEqual('2021-04-19');
    });
  });

  describe('convertDateToTimestamp', () => {
    it('should return a timestamp', () => {
      const result = convertDateToTimestamp('2023-12-31 00:00:00.000Z');
      expect(typeof result).toEqual('string');
    });
  });
});
