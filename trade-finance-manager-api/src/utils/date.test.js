const { formatYear, formatDate, formatTimestamp, convertDateToTimestamp, getIsoStringWithOffset } = require('./date');

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
    it('should return a date in the correct format', () => {
      const mockDate = new Date('2021-04-19');
      const result = formatDate(mockDate);

      const expected = '2021-04-19';
      expect(result).toEqual(expected);
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

  describe('getIsoStringWithOffset', () => {
    it('returns an ISO-8601 string with offset when timezone is GMT', () => {
      const date = new Date('2024-03-02');

      const result = getIsoStringWithOffset(date);

      expect(result).toBe('2024-03-02T00:00:00+00:00');
    });

    it('returns an ISO-8601 string with offset when timezone is BST', () => {
      const date = new Date('2024-07-02');

      const result = getIsoStringWithOffset(date);

      expect(result).toBe('2024-07-02T01:00:00+01:00');
    });
  });
});
