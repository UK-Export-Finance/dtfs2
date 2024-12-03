import { probabilityOfDefaultValidation } from './index';

describe('probabilityOfDefaultValidation()', () => {
  describe('when probabilityOfDefault is 14', () => {
    it('should return true', () => {
      const probabilityOfDefaultPercentage = '14';

      const result = probabilityOfDefaultValidation(probabilityOfDefaultPercentage);

      expect(result).toEqual(true);
    });
  });

  describe('when probabilityOfDefault is 14.09', () => {
    it('should return true', () => {
      const probabilityOfDefaultPercentage = '14.09';

      const result = probabilityOfDefaultValidation(probabilityOfDefaultPercentage);

      expect(result).toEqual(true);
    });
  });

  describe('when probabilityOfDefault is 0.01', () => {
    it('should return true', () => {
      const probabilityOfDefaultPercentage = '0.01';

      const result = probabilityOfDefaultValidation(probabilityOfDefaultPercentage);

      expect(result).toEqual(true);
    });
  });

  describe('when probabilityOfDefault is 0', () => {
    it('should return false', () => {
      const probabilityOfDefaultPercentage = '0';

      const result = probabilityOfDefaultValidation(probabilityOfDefaultPercentage);

      expect(result).toEqual(false);
    });
  });

  describe('when probabilityOfDefault is 14.1', () => {
    it('should return false', () => {
      const probabilityOfDefaultPercentage = '14.1';

      const result = probabilityOfDefaultValidation(probabilityOfDefaultPercentage);

      expect(result).toEqual(false);
    });
  });

  describe('when probabilityOfDefault is 12.552', () => {
    it('should return false', () => {
      const probabilityOfDefaultPercentage = '12.552';

      const result = probabilityOfDefaultValidation(probabilityOfDefaultPercentage);

      expect(result).toEqual(false);
    });
  });

  describe('when probabilityOfDefault is a', () => {
    it('should return false', () => {
      const probabilityOfDefaultPercentage = 'a';

      const result = probabilityOfDefaultValidation(probabilityOfDefaultPercentage);

      expect(result).toEqual(false);
    });
  });
});
