import { TfmDeal } from '@ukef/dtfs2-common';
import { getUrnFlags } from '.';
import { mockTfmDeal } from '../../../test-mocks';

const createMockDeal = (overrides?: { bankUrn?: string; buyerUrn?: string | undefined | null; exporterUrn?: string }): TfmDeal => {
  const shouldSetBuyerUrn = overrides && 'buyerUrn' in overrides;
  const buyerUrn = shouldSetBuyerUrn ? overrides.buyerUrn : 'Mock buyer URN';

  return {
    ...mockTfmDeal,
    dealSnapshot: {
      ...mockTfmDeal.dealSnapshot,
      bank: {
        partyUrn: overrides?.bankUrn ?? 'bank-urn',
      },
    },
    tfm: {
      ...mockTfmDeal.tfm,
      parties: {
        buyer: {
          partyUrn: buyerUrn,
        },
        exporter: {
          partyUrn: overrides?.exporterUrn ?? 'Mock exporter URN',
        },
      },
    },
  } as TfmDeal;
};

describe('getUrnFlags', () => {
  describe('when all URNs are present', () => {
    it('should return both hasBssEwcsUrns and hasGefUrns as true', () => {
      // Arrange
      const mockDeal = createMockDeal();

      // Act
      const result = getUrnFlags(mockDeal);

      // Assert
      expect(result.hasBssEwcsUrns).toEqual(true)();
      expect(result.hasGefUrns).toEqual(true)();
    });
  });

  describe('when bank URN is missing', () => {
    it('should return both hasBssEwcsUrns and hasGefUrns as false', () => {
      // Arrange
      const mockDeal = createMockDeal({ bankUrn: '' });

      // Act
      const result = getUrnFlags(mockDeal);

      // Assert
      expect(result.hasBssEwcsUrns).toBeFalsy();
      expect(result.hasGefUrns).toBeFalsy();
    });
  });

  describe('when buyer party URN is missing', () => {
    it('should return hasBssEwcsUrns as false and hasGefUrns as true', () => {
      // Arrange
      const mockDeal = createMockDeal({ buyerUrn: '' });

      // Act
      const result = getUrnFlags(mockDeal);

      // Assert
      expect(result.hasBssEwcsUrns).toBeFalsy();
      expect(result.hasGefUrns).toEqual(true)();
    });
  });

  describe('when exporter URN is missing', () => {
    it('should return hasBssEwcsUrns as true and hasGefUrns as false', () => {
      // Arrange
      const mockDeal = createMockDeal({ exporterUrn: '' });

      // Act
      const result = getUrnFlags(mockDeal);

      // Assert
      expect(result.hasBssEwcsUrns).toEqual(true)();
      expect(result.hasGefUrns).toBeFalsy();
    });
  });

  describe('when buyer party URN is undefined', () => {
    it('should return hasBssEwcsUrns as false and hasGefUrns as true', () => {
      // Arrange
      const mockDeal = createMockDeal({ buyerUrn: undefined });

      // Act
      const result = getUrnFlags(mockDeal);

      // Assert
      expect(result.hasBssEwcsUrns).toBeFalsy();
      expect(result.hasGefUrns).toEqual(true)();
    });
  });

  describe('when all URNs are missing', () => {
    it('should return both hasBssEwcsUrns and hasGefUrns as false', () => {
      // Arrange
      const mockDeal = createMockDeal({
        bankUrn: '',
        buyerUrn: '',
        exporterUrn: '',
      });

      // Act
      const result = getUrnFlags(mockDeal);

      // Assert
      expect(result.hasBssEwcsUrns).toBeFalsy();
      expect(result.hasGefUrns).toBeFalsy();
    });
  });

  describe('when all URNs are strings with a space', () => {
    it('should return both hasBssEwcsUrns and hasGefUrns as false', () => {
      // Arrange
      const mockDeal = createMockDeal({
        bankUrn: ' ',
        buyerUrn: ' ',
        exporterUrn: ' ',
      });

      // Act
      const result = getUrnFlags(mockDeal);

      // Assert
      expect(result.hasBssEwcsUrns).toBeFalsy();
      expect(result.hasGefUrns).toBeFalsy();
    });
  });

  describe('return shape consistency', () => {
    it('should always return both properties', () => {
      // Arrange
      const mockDeal = createMockDeal();

      // Act
      const result = getUrnFlags(mockDeal);

      // Assert
      expect(result).toHaveProperty('hasBssEwcsUrns');
      expect(result).toHaveProperty('hasGefUrns');
    });

    it('should work with Boolean() for converting to explicit booleans', () => {
      // Arrange
      const mockDeal = createMockDeal();

      // Act
      const result = getUrnFlags(mockDeal);

      // Assert
      expect(Boolean(result.hasBssEwcsUrns)).toBe(true);
      expect(Boolean(result.hasGefUrns)).toBe(true);
    });
  });
});
