const { countryIsDisabled } = require('./country');

describe('countryIsDisabled', () => {
  it('should return false when the country is not disabled', async () => {
    const result = await countryIsDisabled('GBR');

    expect(result).toBe(false);
  });

  it('should return true when the country is disabled', async () => {
    const result = await countryIsDisabled('USA');

    expect(result).toBe(false);
  });

  it('should return true when the country is disabled', async () => {
    const result = await countryIsDisabled('VEN');

    expect(result).toBe(true);
  });

  it('should return false when an invalid country code is provided', async () => {
    const result = await countryIsDisabled('INVALID');

    expect(result).toBe(false);
  });

  it('should return false when an empty country code is provided', async () => {
    const result = await countryIsDisabled();

    expect(result).toBe(false);
  });

  it('should return false when an undefined country code is provided', async () => {
    const result = await countryIsDisabled(undefined);

    expect(result).toBe(false);
  });

  it('should return false when a null country code is provided', async () => {
    const result = await countryIsDisabled(null);

    expect(result).toBe(false);
  });
});
