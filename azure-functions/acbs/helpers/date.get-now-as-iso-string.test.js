const { getNowAsIsoString } = require('./date');

describe('getNowAsIsoString', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('when timezone is GMT returns the current date formatted to ISO-8601 without milliseconds & with UTC offset', () => {
    jest.setSystemTime(1709337600000); // Sat Mar 02 2024 00:00:00 GMT+0000

    const result = getNowAsIsoString();

    expect(result).toEqual('2024-03-02T00:00:00+00:00');
  });

  it('when timezone is BST returns the current date formatted to ISO-8601 without milliseconds & with UTC offset', () => {
    jest.setSystemTime(1723244400000); // Sat Aug 10 2024 00:00:00 GMT+0100 (British Summer Time)

    const result = getNowAsIsoString();

    expect(result).toEqual('2024-08-10T00:00:00+01:00');
  });
});
