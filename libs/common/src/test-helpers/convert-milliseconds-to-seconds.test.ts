import { convertMillisecondsToSeconds } from './convert-milliseconds-to-seconds';

describe('convert-milliseconds-to-seconds', () => {
  describe('convertMillisecondsToSeconds', () => {
    it('divides the passed in number by 1000 and rounds the result - rounding down', () => {
      // Arrange
      const milliseconds = 1729521390;

      // Act
      const seconds = convertMillisecondsToSeconds(milliseconds);

      // Assert
      expect(seconds).toEqual(1729521);
    });

    it('divides the passed in number by 1000 and rounds the result - rounding up', () => {
      // Arrange
      const milliseconds = 1729521500;

      // Act
      const seconds = convertMillisecondsToSeconds(milliseconds);

      // Assert
      expect(seconds).toEqual(1729522);
    });
  });
});
