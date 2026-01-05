import validateMarginFee from './margin-fee';

describe('validateMarginFee', () => {
  const fieldName = 'marginFee';
  const fieldTitle = 'Margin Fee';

  it('should return error if value is missing', () => {
    const entity = { [fieldName]: '' };
    const errorList = {};
    const result = validateMarginFee(entity, fieldName, fieldTitle, errorList);
    expect(result[fieldName].text).toBe('Enter the Margin Fee');
  });

  it('should return error if value is not a number', () => {
    const entity = { [fieldName]: 'abc' };
    const errorList = {};
    const result = validateMarginFee(entity, fieldName, fieldTitle, errorList);
    expect(result[fieldName].text).toBe('Margin Fee must be a number, like 1 or 12.65');
  });

  it('should return error if value is 0', () => {
    const entity = { [fieldName]: '0' };
    const errorList = {};
    const result = validateMarginFee(entity, fieldName, fieldTitle, errorList);
    expect(result[fieldName].text).toBe('Margin Fee must be between 1 and 99');
  });

  it('should return error if value is less than 0', () => {
    const entity = { [fieldName]: '-1' };
    const errorList = {};
    const result = validateMarginFee(entity, fieldName, fieldTitle, errorList);
    expect(result[fieldName].text).toBe('Margin Fee must be between 1 and 99');
  });

  it('should return error if value is greater than 99', () => {
    const entity = { [fieldName]: '100' };
    const errorList = {};
    const result = validateMarginFee(entity, fieldName, fieldTitle, errorList);
    expect(result[fieldName].text).toBe('Margin Fee must be between 1 and 99');
  });

  it('should return error if value has more than 4 decimals', () => {
    const entity = { [fieldName]: '12.12345' };
    const errorList = {};
    const result = validateMarginFee(entity, fieldName, fieldTitle, errorList);
    expect(result[fieldName].text).toBe('Margin Fee must have less than 5 decimals, like 12 or 12.0010');
  });

  it('should not return error for valid integer value', () => {
    const entity = { [fieldName]: '5' };
    const errorList = {};
    const result = validateMarginFee(entity, fieldName, fieldTitle, errorList);
    expect(result[fieldName]).toBeUndefined();
  });

  it('should not return error for valid decimal value', () => {
    const entity = { [fieldName]: '12.1234' };
    const errorList = {};
    const result = validateMarginFee(entity, fieldName, fieldTitle, errorList);
    expect(result[fieldName]).toBeUndefined();
  });

  it('should pass for all values in range 1 to 99', () => {
    for (let i = 1; i <= 99; i += 10) {
      const entity = { [fieldName]: i.toString() };
      const errorList = {};
      const result = validateMarginFee(entity, fieldName, fieldTitle, errorList);
      expect(result[fieldName]).toBeUndefined();
    }
    // Also test edge values
    [1, 99].forEach((val) => {
      const entity = { [fieldName]: val.toString() };
      const errorList = {};
      const result = validateMarginFee(entity, fieldName, fieldTitle, errorList);
      expect(result[fieldName]).toBeUndefined();
    });
  });
});
