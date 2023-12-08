const { isValidIsoMonth } = require('./date');

describe('date utils', () => {
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
