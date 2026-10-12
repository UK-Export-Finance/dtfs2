import { roundTo2Decimals } from '.';

describe('roundTo2Decimals', () => {
  it('should round floating point precision artifacts to 2 decimal places', () => {
    expect.assertions(1);

    // Arrange
    const value = 119999.64000000004;

    // Act
    const result = roundTo2Decimals(value);

    // Assert
    expect(result).toStrictEqual(119999.64);
  });

  it('should round values up at 3rd decimal place', () => {
    expect.assertions(1);

    // Arrange
    const value = 12.345;

    // Act
    const result = roundTo2Decimals(value);

    // Assert
    expect(result).toStrictEqual(12.35);
  });

  it('should round 1.005 to 1.01', () => {
    expect.assertions(1);

    // Arrange
    const value = 1.005;

    // Act
    const result = roundTo2Decimals(value);

    // Assert
    expect(result).toStrictEqual(1.01);
  });

  it('should round -1.005 to -1.01', () => {
    expect.assertions(1);

    // Arrange
    const value = -1.005;

    // Act
    const result = roundTo2Decimals(value);

    // Assert
    expect(result).toStrictEqual(-1.01);
  });

  it('should round values down at 3rd decimal place', () => {
    expect.assertions(1);

    // Arrange
    const value = 12.344;

    // Act
    const result = roundTo2Decimals(value);

    // Assert
    expect(result).toStrictEqual(12.34);
  });
});
