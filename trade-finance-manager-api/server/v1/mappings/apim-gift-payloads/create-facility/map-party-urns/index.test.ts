import { TfmDeal } from '@ukef/dtfs2-common';
import { mapPartyUrns } from '.';

describe('mapPartyUrns', () => {
  const mockBankPartyUrn = '00112233';
  const mockBuyerPartyUrn = '00445566';
  const mockExporterPartyUrn = '00778899';

  const mockDealBase = {
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

  const facilityFlagsAllFalse = {
    isBssFacility: false,
    isCashFacility: false,
    isContingentFacility: false,
    isEwcsFacility: false,
  };

  describe('when isBssFacility is true', () => {
    const isBssFacility = true;

    it('should return bondGiver, bondBeneficiary, and exporterPartyUrn', () => {
      // Arrange & Act
      const result = mapPartyUrns({
        deal: mockDealBase,
        ...facilityFlagsAllFalse,
        isBssFacility,
      });

      // Assert
      expect(result).toEqual({
        bondBeneficiary: mockBuyerPartyUrn,
        bondGiver: mockBankPartyUrn,
        exporterPartyUrn: mockExporterPartyUrn,
      });
    });

    describe('when deal.tfm.parties.buyer.partyUrn is null', () => {
      it('should return an object without bondBeneficiary', () => {
        // Arrange
        const mockDeal = {
          ...mockDealBase,
          tfm: {
            parties: {
              buyer: { partyUrn: null },
              exporter: { partyUrn: mockExporterPartyUrn },
            },
          },
        } as unknown as TfmDeal;

        // Act
        const result = mapPartyUrns({
          deal: mockDeal,
          ...facilityFlagsAllFalse,
          isBssFacility,
        });

        // Assert
        expect(result).toEqual({
          bondGiver: mockBankPartyUrn,
          exporterPartyUrn: mockExporterPartyUrn,
        });
      });
    });

    describe('when deal.tfm.parties.buyer.partyUrn is undefined', () => {
      it('should return an object without bondBeneficiary', () => {
        // Arrange
        const mockDeal = {
          ...mockDealBase,
          tfm: {
            parties: {
              buyer: { partyUrn: undefined },
              exporter: { partyUrn: mockExporterPartyUrn },
            },
          },
        } as unknown as TfmDeal;

        // Act
        const result = mapPartyUrns({
          deal: mockDeal,
          ...facilityFlagsAllFalse,
          isBssFacility,
        });

        // Assert
        expect(result).toEqual({
          bondGiver: mockBankPartyUrn,
          exporterPartyUrn: mockExporterPartyUrn,
        });
      });
    });
  });

  describe('when isEwcsFacility is true', () => {
    it('should return buyer and issuingBank party URNs', () => {
      // Arrange & Act
      const result = mapPartyUrns({
        deal: mockDealBase,
        ...facilityFlagsAllFalse,
        isEwcsFacility: true,
      });

      // Assert
      expect(result).toEqual({
        buyer: mockBuyerPartyUrn,
        issuingBank: mockBankPartyUrn,
      });
    });
  });

  describe('when isCashFacility is true', () => {
    it('should return issuingBank and exporterPartyUrn', () => {
      // Arrange & Act
      const result = mapPartyUrns({
        deal: mockDealBase,
        ...facilityFlagsAllFalse,
        isCashFacility: true,
      });

      // Assert
      expect(result).toEqual({
        issuingBank: mockBankPartyUrn,
        exporterPartyUrn: mockExporterPartyUrn,
      });
    });
  });

  describe('when isContingentFacility is true', () => {
    it('should return issuingBank and exporterPartyUrn', () => {
      // Arrange & Act
      const result = mapPartyUrns({
        deal: mockDealBase,
        ...facilityFlagsAllFalse,
        isContingentFacility: true,
      });

      // Assert
      expect(result).toEqual({
        issuingBank: mockBankPartyUrn,
        exporterPartyUrn: mockExporterPartyUrn,
      });
    });
  });

  describe('when all facility flags are false', () => {
    it('should return only exporterPartyUrn', () => {
      // Arrange & Act
      const result = mapPartyUrns({
        deal: mockDealBase,
        ...facilityFlagsAllFalse,
      });

      // Assert
      expect(result).toEqual({
        exporterPartyUrn: mockExporterPartyUrn,
      });
    });
  });
});
