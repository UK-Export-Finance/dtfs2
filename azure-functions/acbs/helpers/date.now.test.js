const { now } = require('./date');

describe('now', () => {
  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(1709337600000); // Sat Mar 02 2024 00:00:00 GMT+0000
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('returns the current date in the format `yyyy-MM-dd', () => {
    const result = now();

    expect(result).toEqual('2024-03-02');
  });
});
