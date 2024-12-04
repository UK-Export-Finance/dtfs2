import { decodeHtmlEntities } from './decode-html-entities';

describe('decodeHtmlEntities', () => {
  it('should return empty string when input is undefined', () => {
    // Act
    const result = decodeHtmlEntities(undefined);

    // Assert
    expect(result).toEqual('');
  });

  it('should return empty string when input is empty string', () => {
    // Act
    const result = decodeHtmlEntities('');

    // Assert
    expect(result).toEqual('');
  });

  it('should decode a string containing multiple HTML entities', () => {
    // Arrange
    const input = '7 &lt; 77 &amp; some other information&#33;';
    const expected = '7 < 77 & some other information!';

    // Act
    const result = decodeHtmlEntities(input);

    // Assert
    expect(result).toEqual(expected);
  });
});
