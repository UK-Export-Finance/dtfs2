import { generateMockedNumberGeneratorIds } from './generate-mocked-number-generator-ids';
import { getNowAsUtcISOString } from './date';

const type = 1;
const createdBy = 'Portal v2/TFM';
const createdDatetime = getNowAsUtcISOString(true);
const requestingSystem = 'Portal v2/TFM';

describe('generate-mocked-number-generator-ids', () => {
  describe('when generating a single mocked number generator ID', () => {
    it('should return a generated object with the correct properties', () => {
      // Act
      const result = generateMockedNumberGeneratorIds();

      // Assert
      expect(typeof result[0]!.id).toBe('number');
      expect(typeof result[0]!.maskedId).toBe('string');
      expect(result[0]!.maskedId.startsWith('003')).toBe(true);
      expect(result[0]!.type).toBe(type);
      expect(result[0]!.createdBy).toBe(createdBy);
      expect(result[0]!.createdDatetime).toBe(createdDatetime);
      expect(result[0]!.requestingSystem).toBe(requestingSystem);
    });
  });

  describe('when generating a multiple mocked number generator IDs', () => {
    it('should not have the same id or masked ids', () => {
      // Act
      const result1 = generateMockedNumberGeneratorIds();
      const result2 = generateMockedNumberGeneratorIds();

      // Assert
      expect(result1[0]!.id).not.toEqual(result2[0]!.id);
      expect(result1[0]!.maskedId).not.toEqual(result2[0]!.maskedId);
    });
  });
});
