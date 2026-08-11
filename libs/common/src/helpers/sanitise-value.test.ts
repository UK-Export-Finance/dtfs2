import { sanitiseValue } from './sanitise-value';

describe('sanitiseValue', () => {
  it('should sanitise strings', () => {
    // Arrange
    const input = '<script>alert(1)</script><p>Hello</p>';

    // Act
    const result = sanitiseValue(input);

    // Assert
    const expected = '<p>Hello</p>';

    expect(result).toEqual(expected);
  });

  it('should sanitise nested objects and arrays', () => {
    // Arrange
    const input = {
      message: '<b>Hi</b>',
      nested: {
        details: '<img src=x onerror=alert(1) />',
        items: ['<i>one</i>', '<script>two</script><span>two</span>'],
      },
    };

    // Act
    const result = sanitiseValue(input);

    // Assert
    const expected = {
      message: '<b>Hi</b>',
      nested: {
        details: '',
        items: ['<i>one</i>', '<span>two</span>'],
      },
    };

    expect(result).toEqual(expected);
  });

  it('should return numbers unchanged', () => {
    // Arrange
    const input = 123;

    // Act
    const result = sanitiseValue(input);

    // Assert
    const expected = 123;

    expect(result).toEqual(expected);
  });

  it('should return booleans unchanged', () => {
    // Arrange
    const input = true;

    // Act
    const result = sanitiseValue(input);

    // Assert
    const expected = true;

    expect(result).toEqual(expected);
  });

  it('should return null unchanged', () => {
    // Arrange
    const input = null;

    // Act
    const result = sanitiseValue(input);

    // Assert
    const expected = null;

    expect(result).toEqual(expected);
  });

  it('should return undefined unchanged', () => {
    // Arrange
    const input = undefined;

    // Act
    const result = sanitiseValue(input);

    // Assert
    const expected = undefined;

    expect(result).toEqual(expected);
  });
});
