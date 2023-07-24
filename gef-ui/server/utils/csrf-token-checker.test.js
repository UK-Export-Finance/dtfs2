const { isCsrfTokenValid } = require('./csrf-token-checker');

describe('isCsrfTokenValid()', () => {
  const storedCsrfToken = {
    token: '1234567890',
    expiry: new Date('2020-01-01 12:15:00'),
  };
  it('should return true if token is the same and within expiry', () => {
    jest.useFakeTimers().setSystemTime(new Date('2020-01-01 12:10:00'));
    const isValid = isCsrfTokenValid(storedCsrfToken.token, storedCsrfToken);

    expect(isValid).toEqual(true);
  });

  it('should return false if token does not match', () => {
    jest.useFakeTimers().setSystemTime(new Date('2020-01-01 12:10:00'));
    const isValid = isCsrfTokenValid('0987654321', storedCsrfToken);

    expect(isValid).toEqual(false);
  });

  it('should return false if token is the same but it is past the expiry', () => {
    jest.useFakeTimers().setSystemTime(new Date('2020-01-01 12:20:00'));
    const isValid = isCsrfTokenValid(storedCsrfToken.token, storedCsrfToken);

    expect(isValid).toEqual(false);
  });
});
