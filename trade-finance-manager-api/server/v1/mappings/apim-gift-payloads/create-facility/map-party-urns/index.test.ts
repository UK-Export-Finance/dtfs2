import { TfmDeal } from '@ukef/dtfs2-common';
import { mapPartyUrns } from '.';

describe('mapPartyUrns', () => {
  const mockBankPartyUrn = '00112233';

  describe('when isBssEwcsDeal is true', () => {
    const isBssEwcsDeal = true;
    const isGefDeal = false;
    const mockBuyerPartyUrn = '00445566';

    it('should return an object with bondBeneficiary and bondGiver party URNs', () => {
      // Arrange
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
        isBssEwcsDeal,
        isGefDeal,
      });

      // Assert
      const expected = {
        bondBeneficiary: mockBuyerPartyUrn,
        bondGiver: mockBankPartyUrn,
      };

      expect(result).toEqual(expected);
    });

    describe('when deal.tfm.parties.buyer.partyUrn is null', () => {
      it('should return an object with bondBeneficiary as an empty string', () => {
        // Arrange
        const mockDeal = {
          dealSnapshot: {
            bank: {
              partyUrn: mockBankPartyUrn,
            },
          },
          tfm: {
            parties: {
              buyer: {
                partyUrn: '',
              },
            },
          },
        } as TfmDeal;

        // Act
        const result = mapPartyUrns({
          deal: mockDeal,
          isBssEwcsDeal,
          isGefDeal,
        });

        // Assert
        const expected = {
          bondBeneficiary: '',
          bondGiver: mockBankPartyUrn,
        };

        expect(result).toEqual(expected);
      });
    });
  });

  describe('when isGefDeal is true', () => {
    it('should return an object with issuingBank party URN', () => {
      // Arrange
      const isBssEwcsDeal = false;
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
        isBssEwcsDeal,
        isGefDeal,
      });

      // Assert
      const expected = {
        issuingBank: mockBankPartyUrn,
      };

      expect(result).toEqual(expected);
    });
  });

  describe('when isBssEwcsDeal and isGefDeal are both false', () => {
    it('should return an empty object', () => {
      // Arrange
      const isBssEwcsDeal = false;
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
        isBssEwcsDeal,
        isGefDeal,
      });

      // Assert
      expect(result).toEqual({});
    });
  });
});
