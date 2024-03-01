const { formatYear, formatDate, formatTimestamp, convertDateToTimestamp, isValidIsoMonth } = require('./date');

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

  describe('isValidIsoMonth', () => {
    it.each(['2023-11-01', '2023-13', '202-11', 'invalid', '', 202311, undefined, null, ['2023-11'], { date: '2023-11' }])(
      'returns false when the value is %p',
      (value) => {
        expect(isValidIsoMonth(value)).toBe(false);
      },
    );

    it('returns true when a valid ISO month value is provided', () => {
      expect(isValidIsoMonth('2023-11')).toBe(true);
    });
  });
});
