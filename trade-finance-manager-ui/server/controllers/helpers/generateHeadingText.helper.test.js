import { generateHeadingText } from './index';

describe('generateHeadingText', () => {
  describe('when count is 1', () => {
    it('should return correct text', () => {
      const mockSubmittedValue = 'test';

      const result = generateHeadingText(1, mockSubmittedValue);

      const expected = `1 result for "${mockSubmittedValue}"`;
      expect(result).toEqual(expected);
    });
  });

  describe('when count is greater than 1', () => {
    it('should return correct text', () => {
      const mockSubmittedValue = 'test';

      const result = generateHeadingText(2, mockSubmittedValue);

      const expected = `2 results for "${mockSubmittedValue}"`;
      expect(result).toEqual(expected);
    });
  });

  describe('when count is 0', () => {
    it('should return correct text', () => {
      const mockSubmittedValue = 'test';

      const result = generateHeadingText(0, mockSubmittedValue);

      const expected = `0 results for "${mockSubmittedValue}"`;
      expect(result).toEqual(expected);
    });
  });

  describe('when there is no submittedValue', () => {
    it('should return `All deals` text', () => {
      const result = generateHeadingText(0, '');

      const expected = 'All deals';
      expect(result).toEqual(expected);
    });
  });
});
