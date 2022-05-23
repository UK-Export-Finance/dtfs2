import { generateHeadingText, probabilityOfDefaultValidation } from './index';

describe('deal - helpers', () => {
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

  describe('probabilityOfDefaultValidation()', () => {
    describe('when probabilityOfDefault is 14', () => {
      it('should return true', () => {
        const probabilityofDefaultPercentage = '14';

        const result = probabilityOfDefaultValidation(probabilityofDefaultPercentage);

        expect(result).toEqual(true);
      });
    });

    describe('when probabilityOfDefault is 14.09', () => {
      it('should return true', () => {
        const probabilityofDefaultPercentage = '14.09';

        const result = probabilityOfDefaultValidation(probabilityofDefaultPercentage);

        expect(result).toEqual(true);
      });
    });

    describe('when probabilityOfDefault is 0.01', () => {
      it('should return true', () => {
        const probabilityofDefaultPercentage = '0.01';

        const result = probabilityOfDefaultValidation(probabilityofDefaultPercentage);

        expect(result).toEqual(true);
      });
    });

    describe('when probabilityOfDefault is 0', () => {
      it('should return false', () => {
        const probabilityofDefaultPercentage = '0';

        const result = probabilityOfDefaultValidation(probabilityofDefaultPercentage);

        expect(result).toEqual(false);
      });
    });

    describe('when probabilityOfDefault is 14.1', () => {
      it('should return false', () => {
        const probabilityofDefaultPercentage = '14.1';

        const result = probabilityOfDefaultValidation(probabilityofDefaultPercentage);

        expect(result).toEqual(false);
      });
    });

    describe('when probabilityOfDefault is 12.552', () => {
      it('should return false', () => {
        const probabilityofDefaultPercentage = '12.552';

        const result = probabilityOfDefaultValidation(probabilityofDefaultPercentage);

        expect(result).toEqual(false);
      });
    });

    describe('when probabilityOfDefault is a', () => {
      it('should return false', () => {
        const probabilityofDefaultPercentage = 'a';

        const result = probabilityOfDefaultValidation(probabilityofDefaultPercentage);

        expect(result).toEqual(false);
      });
    });
  });
});
