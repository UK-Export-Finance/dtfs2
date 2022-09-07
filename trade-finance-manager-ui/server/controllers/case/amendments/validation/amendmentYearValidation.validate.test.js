const amendmentmentYearValidation = require('./amendmentYearValidation.validate');

describe('amendmentmentYearValidation()', () => {
  it('should return true when year is 2 numbers long', () => {
    const year = '22';
    const result = amendmentmentYearValidation(year);

    expect(result).toEqual(true);
  });

  it('should return true when year includes a letter', () => {
    const year = '2O22';
    const result = amendmentmentYearValidation(year);

    expect(result).toEqual(true);
  });

  it('should return true when year is a blank string', () => {
    const year = '';
    const result = amendmentmentYearValidation(year);

    expect(result).toEqual(true);
  });

  it('should return true when year is a space', () => {
    const year = ' ';
    const result = amendmentmentYearValidation(year);

    expect(result).toEqual(true);
  });

  it('should return true when year is null', () => {
    const year = null;
    const result = amendmentmentYearValidation(year);

    expect(result).toEqual(true);
  });

  it('should return false when year is 4 numbers', () => {
    const year = '2022';
    const result = amendmentmentYearValidation(year);

    expect(result).toEqual(false);
  });
});
