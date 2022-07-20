const convertToTimestamp = require('../../src/v1/helpers/convertToTimestamp');

describe('convertToTimestamp()', () => {
  it('Should return a timestamp in the normal time format for date passed as a string', () => {
    const date = 'July 19, 2022';

    const result = convertToTimestamp(date);

    const expected = new Date('2022-07-19T00:00:00.000Z');

    expect(result).toEqual(expected);
  });
});
