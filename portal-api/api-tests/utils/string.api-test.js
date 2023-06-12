const {
  isEmptyString,
  hasValue,
  isValidEmail
} = require('../../src/utils/string');

describe('utils - string', () => {
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

/*
Objective:
The main objective of the isValidEmail function is to validate whether a given email
address is in a correct format or not. It checks if the email address follows the standard syntax rules for email addresses.

Inputs:
- email: a string representing the email address to be validated.

Flow:
- The function takes in an email address as input.
- It creates a regular expression pattern using the regex variable.
- It uses the test method of the regex object to check if the email address matches the pattern.
- If the email address matches the pattern, the function returns true, indicating that the email address is valid. Otherwise, it returns false.

Outputs:
- true: if the email address is valid and matches the pattern.
- false: if the email address is not valid and does not match the pattern.

Additional aspects:
- The regular expression pattern used in the function checks for the standard syntax rules
  for email addresses, including the presence of an "@" symbol, a domain name, and a top-level domain.
- The function does not check if the email address actually exists or is deliverable. It only checks if the email address is in a correct format.
*/

describe('isValidEmail function', () => {
  // Tests that a valid email is recognized as such
  it('should test valid email', () => {
    const email = 'test@ukexportfinance.gov.uk';
    expect(isValidEmail(email)).toBe(true);
  });

  // Tests that an email with special characters is recognized as valid
  it('should test email with special characters', () => {
    const email = 'test.email+123@example.co.uk';
    expect(isValidEmail(email)).toBe(true);
  });

  // Tests that an empty email is recognized as invalid
  it('should test empty email', () => {
    const email = '';
    expect(isValidEmail(email)).toBe(false);
  });

  // Tests that an email without an '@' symbol is recognized as invalid
  it('should test email without at symbol', () => {
    const email = 'testukexportfinance.gov.uk';
    expect(isValidEmail(email)).toBe(false);
  });

  // Tests that an email without a top-level domain is recognized as invalid
  it('should test email without top level domain', () => {
    const email = 'test@example';
    expect(isValidEmail(email)).toBe(false);
  });

  // Tests that an email with multiple '@' symbols is recognized as invalid
  it('should test email with multiple at symbols', () => {
    const email = 'test@example@com';
    expect(isValidEmail(email)).toBe(false);
  });

  // Tests that an email with invalid characters is recognized as invalid
  it('should test email with invalid characters', () => {
    const email = 'test!ukexportfinance.gov.uk';
    expect(isValidEmail(email)).toBe(false);
  });

  // Tests that email addresses are case-insensitive
  it('should test case sensitivity', () => {
    const email1 = 'Test@ukexportfinance.gov.uk';
    const email2 = 'tEsT@ukexportfinance.gov.uk';
    expect(isValidEmail(email1)).toBe(true);
    expect(isValidEmail(email2)).toBe(true);
  });

  // Tests that an email with a top-level domain
  it('should test top level domain length', () => {
    const email = 'test@ukexportfinance.gov.ukm';
    expect(isValidEmail(email)).toBe(true);
  });

  // Tests that an internationalized email address is recognized as invalid
  it('should test internationalized email', () => {
    const email = 'test@üñîçøðé.com';
    expect(isValidEmail(email)).toBe(false);
  });
});
