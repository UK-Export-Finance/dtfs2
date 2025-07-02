const { stripDoubleQuotes } = require('./string');

describe('stripDoubleQuotes', () => {
  it('should strip all the double quotes', () => {
    // Arrange
    const string = 'Test with "quotes"';

    // Act
    const response = stripDoubleQuotes(string);

    // Assert
    expect(response).toBe("Test with 'quotes'");
  });
  it('should strip all the leading and trailing empty spaces', () => {
    // Arrange
    const string = ' Test with "quotes"    ';

    // Act
    const response = stripDoubleQuotes(string);

    // Assert
    expect(response).toBe("Test with 'quotes'");
  });

  it('should return the same string as supplied', () => {
    // Arrange
    const string = "Test with 'quotes'";

    // Act
    const response = stripDoubleQuotes(string);

    // Assert
    expect(response).toBe("Test with 'quotes'");
  });

  it('should return the same string as supplied', () => {
    // Arrange
    const string = ' TEST ';

    // Act
    const response = stripDoubleQuotes(string);

    // Assert
    expect(response).toBe('TEST');
  });

  it('should return the same string as supplied', () => {
    // Arrange
    const string = '';

    // Act
    const response = stripDoubleQuotes(string);

    // Assert
    expect(response).toBe('');
  });
});
