import { validUkefId } from './validUkefId';

describe('validUkefId function', () => {
  // Tests that a valid UKEF ID with 10 digits returns the same ID
  it('should test  valid ukef id with 10 digits', () => {
    expect(validUkefId('1234567890')).toBe('1234567890');
  });

  // Tests that a valid UKEF ID with leading zeros returns the same ID
  it('should test  valid ukef id with leading zeros', () => {
    expect(validUkefId('0000123456')).toBe('0000123456');
  });

  // Tests that an empty string returns false
  it('should test  empty string', () => {
    expect(validUkefId('')).toBe(false);
  });

  // Tests that a non-numeric UKEF ID returns false
  it('should test  non numeric ukef id', () => {
    expect(validUkefId('1234a67890')).toBe(false);
  });

  // Tests that a UKEF ID with less than 10 digits returns false
  it('should test  ukef id with less than 10 digits', () => {
    expect(validUkefId('123456789')).toBe(false);
  });

  // Tests that a UKEF ID with more than 10 digits returns false
  it('should test  ukef id with more than 10 digits', () => {
    expect(validUkefId('12345678901')).toBe(false);
  });

  // Tests that a UKEF ID with negative value returns false
  it('should test  negative value ukef id', () => {
    expect(validUkefId('-1234567890')).toBe(false);
  });

  // Tests that a UKEF ID with decimal value returns false
  it('should test  decimal value ukef id', () => {
    expect(validUkefId('1234.567890')).toBe(false);
  });

  // Tests that a UKEF ID with scientific notation returns false
  it('should test  scientific notation ukef id', () => {
    expect(validUkefId('1.234e+9')).toBe(false);
  });

  // Tests that a UKEF ID with non-numeric characters returns false
  it('should test  non numeric characters ukef id', () => {
    expect(validUkefId('1234-567890')).toBe(false);
  });

  // Tests that a UKEF ID with injection returns false
  it('should test  non numeric characters ukef id', () => {
    expect(validUkefId('{u: { $rg: `` }}}')).toBe(false);
  });
});
