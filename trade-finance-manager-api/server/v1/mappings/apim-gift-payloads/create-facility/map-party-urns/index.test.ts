import { TfmDeal } from '@ukef/dtfs2-common';
import { mapPartyUrns } from '.';

describe('mapPartyUrns', () => {
  const mockBankPartyUrn = '00112233';

  describe('when isBssDeal is true', () => {
    const isBssDeal = true;
    const isGefDeal = false;

    it('should return an object with bondBeneficiary and bondGiver party URNs', () => {
      // Arrange
      const mockBuyerPartyUrn = '00445566';

      const mockDeal = {
        dealSnapshot: {
          bank: {
            partyUrn: mockBankPartyUrn,
          },
        },
        tfm: {
          parties: {
            buyer: {
              partyUrn: mockBuyerPartyUrn,
            },
          },
        },
      } as TfmDeal;

      // Act
      const result = mapPartyUrns({
        deal: mockDeal,
        isBssDeal,
        isGefDeal,
      });

      // Assert
      const expected = {
        bondBeneficiary: mockBuyerPartyUrn,
        bondGiver: mockBankPartyUrn,
      };

      expect(result).toEqual(expected);
    });
  });

  describe('when isGefDeal is true', () => {
    it('should return an object with issuingBank party URN', () => {
      // Arrange
      const isBssDeal = false;
      const isGefDeal = true;

      const mockDeal = {
        dealSnapshot: {
          bank: {
            partyUrn: mockBankPartyUrn,
          },
        },
        tfm: {
          parties: {},
        },
      } as TfmDeal;

      // Act
      const result = mapPartyUrns({
        deal: mockDeal,
        isBssDeal,
        isGefDeal,
      });

      // Assert
      const expected = {
        issuingBank: mockBankPartyUrn,
      };

      expect(result).toEqual(expected);
    });
  });

  describe('when isBssDeal and isGefDeal are both false', () => {
    it('should return an empty object', () => {
      // Arrange
      const isBssDeal = false;
      const isGefDeal = false;

      const mockDeal = {
        dealSnapshot: {
          bank: {},
        },
        tfm: {
          parties: {},
        },
      } as unknown as TfmDeal;

      // Act
      const result = mapPartyUrns({
        deal: mockDeal,
        isBssDeal,
        isGefDeal,
      });

      // Assert
      expect(result).toEqual({});
    });
  });
});
