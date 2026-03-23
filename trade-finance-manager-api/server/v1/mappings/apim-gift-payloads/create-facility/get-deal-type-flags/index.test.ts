import { DEAL_TYPE } from '@ukef/dtfs2-common';
import { getDealTypeFlags } from '.';

describe('getDealTypeFlags', () => {
  describe(`when dealType is ${DEAL_TYPE.BSS_EWCS}`, () => {
    it('should return an object with isBssDeal as true', () => {
      // Arrange
      const dealType = DEAL_TYPE.BSS_EWCS;

      // Act
      const result = getDealTypeFlags(dealType);

      // Assert
      const expected = {
        isBssDeal: true,
        isGefDeal: false,
      };

      expect(result).toEqual(expected);
    });
  });

  describe(`when dealType is ${DEAL_TYPE.GEF}`, () => {
    it('should return an object with isGefDeal as true', () => {
      // Arrange
      const dealType = DEAL_TYPE.GEF;

      // Act
      const result = getDealTypeFlags(dealType);

      // Assert
      const expected = {
        isBssDeal: false,
        isGefDeal: true,
      };

      expect(result).toEqual(expected);
    });
  });
});
