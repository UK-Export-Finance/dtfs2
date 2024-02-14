const { isCountryDisabled  } = require('./country');

describe('isCountryDisabled ', () => {
  it('should return false when the country is not disabled', async () => {
    const result = await isCountryDisabled ('GBR');

    expect(result).toBe(false);
  });

  it('should return false when the country is not disabled', async () => {
    const result = await isCountryDisabled ('USA');

    expect(result).toBe(false);
  });

  it('should return true when the country is disabled', async () => {
    const result = await isCountryDisabled ('AFG');

    expect(result).toBe(true);
  });

  it('should return false when an invalid country code is provided', async () => {
    const result = await isCountryDisabled ('INVALID');

    expect(result).toBe(false);
  });

  it('should return false when an empty country code is provided', async () => {
    const result = await isCountryDisabled ();

    expect(result).toBe(false);
  });

  it('should return false when an undefined country code is provided', async () => {
    const result = await isCountryDisabled (undefined);

    expect(result).toBe(false);
  });

  it('should return false when a null country code is provided', async () => {
    const result = await isCountryDisabled (null);

    expect(result).toBe(false);
  });
});
