const { format } = require('date-fns');
const { now } = require('./date');

describe('now', () => {
  it('returns the current date in the format `yyyy-MM-dd', () => {
    const result = now();

    const expected = format(new Date(), 'yyyy-MM-dd');
    expect(result).toBe(expected);
  });
});
