import { replaceNewLinesWithBrTags } from './filter-replaceNewLinesWithBrTags';

describe('nunjuck filters - replaceNewLineWithBrTag', () => {
  it('should replace a single new line character with a <br> tag', () => {
    // Arrange
    const input = 'Hello\nWorld';
    const expectedOutput = 'Hello<br>World';

    // Act
    const result = replaceNewLinesWithBrTags(input);

    // Assert
    expect(result).toEqual(expectedOutput);
  });

  it('should replace multiple new line characters with <br> tags', () => {
    // Arrange
    const input = 'Hello\nWorld\n!';
    const expectedOutput = 'Hello<br>World<br>!';

    // Act
    const result = replaceNewLinesWithBrTags(input);

    // Assert
    expect(result).toEqual(expectedOutput);
  });

  it('should return the same string if there are no new line characters', () => {
    // Arrange
    const input = 'Hello World!';
    const expectedOutput = input;

    // Act
    const result = replaceNewLinesWithBrTags(input);

    // Assert
    expect(result).toEqual(expectedOutput);
  });

  it('should handle an empty string', () => {
    // Arrange
    const input = '';
    const expectedOutput = input;

    // Act
    const result = replaceNewLinesWithBrTags(input);

    // Assert
    expect(result).toEqual(expectedOutput);
  });

  it('should handle strings with only new line characters', () => {
    // Arrange
    const input = '\n\n\n';
    const expectedOutput = '<br><br><br>';

    // Act
    const result = replaceNewLinesWithBrTags(input);

    // Assert
    expect(result).toEqual(expectedOutput);
  });
});
