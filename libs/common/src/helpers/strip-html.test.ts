import { stripHtml } from './strip-html';

describe('stripHtml', () => {
  it('should return text without HTML markups.', () => {
    // Arrange
    const input = "This is a <b>test</b> <a href = '/asset/file.xlsx'>file</a>.";

    // Act
    const result = stripHtml(input);

    // Assert
    expect(result).toBe('This is a test file.');
  });

  it('should return input string with no replacement', () => {
    // Arrange
    const input = 'This is a test.';

    // Act
    const result = stripHtml(input);

    // Assert
    expect(result).toBe('This is a test.');
  });

  it('should return input blank string', () => {
    // Arrange
    const input = '';

    // Act
    const result = stripHtml(input);

    // Assert
    expect(result).toBe('');
  });

  it('should return input string with nested markup tags', () => {
    // Arrange
    const input = 'These are my <u>points</u><ol><li>Point one</li><li>Point two<li></ol>';

    // Act
    const result = stripHtml(input, ' ');

    // Assert
    expect(result).toBe('These are my  points   Point one  Point two  ');
  });

  it('should return input string with no replacement', () => {
    // Arrange
    const input = 'This is a test.';

    // Act
    const result = stripHtml(input, '-');

    // Assert
    expect(result).toBe('This is a test.');
  });
});
