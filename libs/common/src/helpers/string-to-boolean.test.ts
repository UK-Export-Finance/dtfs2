import { stringToBoolean } from './string-to-boolean';

const falseStrings = ['', ' ', '   ', 'undefined', 'undefined ', ' undefined', ' null ', 'null', 'false', '0'];
const trueStrings = ['true', ' true ', ' true', 'true ', '1', 'valid', 'ABC', '123'];

describe('stringToBoolean', () => {
  it.each(falseStrings)('should return false when value provided is %', (value) => {
    // Act
    const result = stringToBoolean(value);

    // Assert
    expect(result).toBeFalsy();
  });

  it.each(trueStrings)('should return true when value provided is %', (value) => {
    // Act
    const result = stringToBoolean(value);

    // Assert
    expect(result).toBeTruthy();
  });
});
