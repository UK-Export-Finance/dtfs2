const { isEmptyString, hasValue, isValidEmail } = require('./string');

describe('utils string', () => {
  describe('isEmptyString', () => {
    it('should return true when string is empty or is pure whitespace', () => {
      expect(isEmptyString('')).toEqual(true);
      expect(isEmptyString(' ')).toEqual(true);
      expect(isEmptyString('   ')).toEqual(true);
    });

    it('should return false when param is a string', () => {
      expect(isEmptyString('a')).toEqual(false);
    });
  });

  describe('hasValue', () => {
    it('should return true when a string is passed', () => {
      expect(hasValue('test')).toEqual(true);
    });

    it('should return false when there is no value passed or is empty/whitespace', () => {
      expect(hasValue()).toEqual(false);
      expect(hasValue(null)).toEqual(false);
      expect(hasValue('')).toEqual(false);
      expect(hasValue(' ')).toEqual(false);
    });
  });
});

describe('isValidEmail function', () => {
  // Tests that a valid email returns true
  it('should test valid email', () => {
    const email = 'test@example.com';
    expect(isValidEmail(email)).toBe(true);
  });

  // Tests that a valid email with uppercase letters returns true
  it('should test valid email uppercase', () => {
    const email = 'Test@Example.com';
    expect(isValidEmail(email)).toBe(true);
  });

  // Tests that a valid email with numbers returns true
  it('should test valid email numbers', () => {
    const email = 'test123@example.com';
    expect(isValidEmail(email)).toBe(true);
  });

  // Tests that an empty string input returns false
  it('should test empty string input', () => {
    const email = '';
    expect(isValidEmail(email)).toBe(false);
  });

  // Tests that a non-string input returns false
  it('should test non string input', () => {
    const email = 123;
    expect(isValidEmail(email)).toBe(false);
  });

  // Tests that an invalid email returns false
  it('should test invalid email', () => {
    const email = 'example.com';
    expect(isValidEmail(email)).toBe(false);
  });

  // Tests that an invalid email without an @ symbol returns false
  it('should test invalid email no at symbol', () => {
    const email = 'testexample.com';
    expect(isValidEmail(email)).toBe(false);
  });

  // Tests that an invalid email without a domain returns false
  it('should test invalid email no domain', () => {
    const email = 'test@';
    expect(isValidEmail(email)).toBe(false);
  });

  // Tests that an invalid email without a username returns false
  it('should test invalid email no username', () => {
    const email = '@example.com';
    expect(isValidEmail(email)).toBe(false);
  });

  // Tests that an invalid email without a top-level domain returns false
  it('should test invalid email no tld', () => {
    const email = 'test@example';
    expect(isValidEmail(email)).toBe(false);
  });

  // Tests that a valid email address returns true
  it('should test valid email', () => {
    const email = 'abc@ukexportfinance.gov.uk';
    expect(isValidEmail(email)).toBe(true);
  });

  // Tests that a valid email address with uppercase letters returns true
  it('should test valid email uppercase', () => {
    const email = 'ABC@UKEXPORTFINANCE.GOV.UK';
    expect(isValidEmail(email)).toBe(true);
  });

  // Tests that a valid email address with numbers returns true
  it('should test valid email numbers', () => {
    const email = 'abc123@ukexportfinance.gov.uk';
    expect(isValidEmail(email)).toBe(true);
  });

  // Tests that an invalid email address input returns false
  it('should test invalid email input', () => {
    const email = 'abc@ukexportfinance';
    expect(isValidEmail(email)).toBe(false);
  });
});
