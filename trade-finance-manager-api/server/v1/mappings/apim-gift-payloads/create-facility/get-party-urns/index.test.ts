import { DEAL_TYPE, TfmDeal } from '@ukef/dtfs2-common';
import { getPartyUrns } from '.';

describe('getPartyUrns', () => {
  const mockBankPartyUrn = '00112233';

  describe(`when the dealType is ${DEAL_TYPE.BSS_EWCS}`, () => {
    const dealType = DEAL_TYPE.BSS_EWCS;

    it('should return an object with bondBeneficiary and bondGiver party URNs', () => {
      // Arrange
      const mockBuyerPartyUrn = '00445566';

      const mockDeal = {
        dealSnapshot: {
          dealType,
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
      const result = getPartyUrns(mockDeal);

      // Assert
      const expected = {
        bondBeneficiary: mockBuyerPartyUrn,
        bondGiver: mockBankPartyUrn,
      };

      expect(result).toEqual(expected);
    });
  });

  describe(`when the dealType is ${DEAL_TYPE.GEF}`, () => {
    it('should return an object with issuingBank party URN', () => {
      // Arrange
      const dealType = DEAL_TYPE.GEF;

      const mockDeal = {
        dealSnapshot: {
          dealType,
          bank: {
            partyUrn: mockBankPartyUrn,
          },
        },
        tfm: {},
      } as TfmDeal;

      // Act
      const result = getPartyUrns(mockDeal);

      // Assert
      const expected = {
        issuingBank: mockBankPartyUrn,
      };

      expect(result).toEqual(expected);
    });
  });

  describe('when the dealType is not recognised', () => {
    it('should return an empty object', () => {
      // Arrange
      const mockDeal = {
        dealSnapshot: {
          dealType: 'MOCK_DEAL_TYPE',
          bank: {},
        },
        tfm: {},
      } as unknown as TfmDeal;

      // Act
      const result = getPartyUrns(mockDeal);

      // Assert
      expect(result).toEqual({});
    });
  });
});
