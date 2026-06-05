import { TfmDeal } from '@ukef/dtfs2-common';
import { mapPartyUrns } from '.';

describe('mapPartyUrns', () => {
  const mockBankPartyUrn = '00112233';
  const mockExporterPartyUrn = '00778899';

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
            exporter: {
              partyUrn: mockExporterPartyUrn,
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
        exporterPartyUrn: mockExporterPartyUrn,
      };

      expect(result).toEqual(expected);
    });

    describe('when deal.tfm.parties.buyer.partyUrn is null', () => {
      it('should return an object without bondBeneficiary', () => {
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
                partyUrn: null,
              },
              exporter: {
                partyUrn: mockExporterPartyUrn,
              },
            },
          },
        } as unknown as TfmDeal;

        // Act
        const result = mapPartyUrns({
          deal: mockDeal,
          isBssEwcsDeal,
          isGefDeal,
        });

        // Assert
        const expected = {
          bondGiver: mockBankPartyUrn,
          exporterPartyUrn: mockExporterPartyUrn,
        };

        expect(result).toEqual(expected);
      });
    });

    describe('when deal.tfm.parties.buyer.partyUrn is undefined', () => {
      it('should return an object without bondBeneficiary', () => {
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
                partyUrn: undefined,
              },
              exporter: {
                partyUrn: mockExporterPartyUrn,
              },
            },
          },
        } as unknown as TfmDeal;

        // Act
        const result = mapPartyUrns({
          deal: mockDeal,
          isBssEwcsDeal,
          isGefDeal,
        });

        // Assert
        const expected = {
          bondGiver: mockBankPartyUrn,
          exporterPartyUrn: mockExporterPartyUrn,
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
          parties: {
            exporter: {
              partyUrn: mockExporterPartyUrn,
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
        issuingBank: mockBankPartyUrn,
        exporterPartyUrn: mockExporterPartyUrn,
      };

      expect(result).toEqual(expected);
    });
  });

  describe('when isBssEwcsDeal and isGefDeal are both false', () => {
    it('should return an object with exporterPartyUrn', () => {
      // Arrange
      const isBssEwcsDeal = false;
      const isGefDeal = false;

      const mockDeal = {
        dealSnapshot: {
          bank: {},
        },
        tfm: {
          parties: {
            exporter: {
              partyUrn: mockExporterPartyUrn,
            },
          },
        },
      } as unknown as TfmDeal;

      // Act
      const result = mapPartyUrns({
        deal: mockDeal,
        isBssEwcsDeal,
        isGefDeal,
      });

      // Assert
      const expected = {
        exporterPartyUrn: mockExporterPartyUrn,
      };

      expect(result).toEqual(expected);
    });
  });
});
