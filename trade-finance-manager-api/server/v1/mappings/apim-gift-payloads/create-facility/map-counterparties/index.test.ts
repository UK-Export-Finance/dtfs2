import { APIM_GIFT_INTEGRATION } from '../../constants';
import { mapCounterparties } from '.';

const {
  DEFAULTS: { COUNTERPARTY_ROLE_CODE },
} = APIM_GIFT_INTEGRATION;

describe('mapCounterparties', () => {
  describe('when isBssFacility is true', () => {
    const isBssFacility = true;
    const isCashFacility = false;
    const isContingentFacility = false;
    const isEwcsFacility = false;

    describe(`when partyUrns.bondGiver exists`, () => {
      it(`should return an array with a "${COUNTERPARTY_ROLE_CODE.BSS.BOND_GIVER}" counterparty`, () => {
        // Arrange
        const mockPartyUrns = {
          bondGiver: '00300130',
        };

        // Act
        const result = mapCounterparties({
          isBssFacility,
          isCashFacility,
          isContingentFacility,
          isEwcsFacility,
          partyUrns: mockPartyUrns,
        });

        // Assert
        const expected = [
          {
            counterpartyUrn: mockPartyUrns.bondGiver,
            roleCode: COUNTERPARTY_ROLE_CODE.BSS.BOND_GIVER,
          },
        ];

        expect(result).toEqual(expected);
      });
    });

    describe(`when partyUrns.bondBeneficiary exists`, () => {
      it(`should return an array with a "${COUNTERPARTY_ROLE_CODE.BSS.BOND_BENEFICIARY}" counterparty`, () => {
        // Arrange
        const mockPartyUrns = {
          bondBeneficiary: '00318345',
        };

        // Act
        const result = mapCounterparties({
          isBssFacility,
          isCashFacility,
          isContingentFacility,
          isEwcsFacility,
          partyUrns: mockPartyUrns,
        });

        // Assert
        const expected = [
          {
            counterpartyUrn: mockPartyUrns.bondBeneficiary,
            roleCode: COUNTERPARTY_ROLE_CODE.BSS.BOND_BENEFICIARY,
          },
        ];

        expect(result).toEqual(expected);
      });
    });

    describe(`when both partyUrns.bondGiver and partyUrns.bondBeneficiary exist`, () => {
      it(`should return an array with a "${COUNTERPARTY_ROLE_CODE.BSS.BOND_GIVER}" counterparty and "${COUNTERPARTY_ROLE_CODE.BSS.BOND_BENEFICIARY}" counterparty`, () => {
        // Arrange
        const mockPartyUrns = {
          bondGiver: '00300130',
          bondBeneficiary: '00318345',
        };

        // Act
        const result = mapCounterparties({
          isBssFacility,
          isCashFacility,
          isContingentFacility,
          isEwcsFacility,
          partyUrns: mockPartyUrns,
        });

        // Assert
        const expected = [
          {
            counterpartyUrn: mockPartyUrns.bondGiver,
            roleCode: COUNTERPARTY_ROLE_CODE.BSS.BOND_GIVER,
          },
          {
            counterpartyUrn: mockPartyUrns.bondBeneficiary,
            roleCode: COUNTERPARTY_ROLE_CODE.BSS.BOND_BENEFICIARY,
          },
        ];

        expect(result).toEqual(expected);
      });
    });

    describe(`when both partyUrns.bondGiver and partyUrns.bondBeneficiary do NOT exist`, () => {
      it('should return an empty array', () => {
        // Arrange
        const mockPartyUrns = {};

        // Act
        const result = mapCounterparties({
          isBssFacility,
          isCashFacility,
          isContingentFacility,
          isEwcsFacility,
          partyUrns: mockPartyUrns,
        });

        // Assert
        expect(result).toEqual([]);
      });
    });
  });

  describe('when isCashFacility is true', () => {
    const isBssFacility = false;
    const isCashFacility = true;
    const isContingentFacility = false;
    const isEwcsFacility = false;

    describe(`when partyUrns.issuingBank exists`, () => {
      it(`should return an array with an "${COUNTERPARTY_ROLE_CODE.ISSUING_BANK}" counterparty`, () => {
        // Arrange
        const mockPartyUrns = {
          issuingBank: '00318345',
        };

        // Act
        const result = mapCounterparties({
          isBssFacility,
          isCashFacility,
          isContingentFacility,
          isEwcsFacility,
          partyUrns: mockPartyUrns,
        });

        // Assert
        const expected = [
          {
            counterpartyUrn: mockPartyUrns.issuingBank,
            roleCode: COUNTERPARTY_ROLE_CODE.ISSUING_BANK,
          },
        ];

        expect(result).toEqual(expected);
      });
    });

    describe(`when partyUrns.issuingBank does NOT exist`, () => {
      it('should return an empty array', () => {
        // Arrange
        const mockPartyUrns = {};

        // Act
        const result = mapCounterparties({
          isBssFacility,
          isCashFacility,
          isContingentFacility,
          isEwcsFacility,
          partyUrns: mockPartyUrns,
        });

        // Assert
        expect(result).toEqual([]);
      });
    });
  });

  describe('when isContingentFacility is true', () => {
    const isBssFacility = false;
    const isCashFacility = false;
    const isContingentFacility = true;
    const isEwcsFacility = false;

    describe(`when partyUrns.issuingBank exists`, () => {
      it(`should return an array with an "${COUNTERPARTY_ROLE_CODE.ISSUING_BANK}" counterparty`, () => {
        // Arrange
        const mockPartyUrns = {
          issuingBank: '00318345',
        };

        // Act
        const result = mapCounterparties({
          isBssFacility,
          isCashFacility,
          isContingentFacility,
          isEwcsFacility,
          partyUrns: mockPartyUrns,
        });

        // Assert
        const expected = [
          {
            counterpartyUrn: mockPartyUrns.issuingBank,
            roleCode: COUNTERPARTY_ROLE_CODE.ISSUING_BANK,
          },
        ];

        expect(result).toEqual(expected);
      });
    });

    describe(`when partyUrns.issuingBank does NOT exist`, () => {
      it('should return an empty array', () => {
        // Arrange
        const mockPartyUrns = {};

        // Act
        const result = mapCounterparties({
          isBssFacility,
          isCashFacility,
          isContingentFacility,
          isEwcsFacility,
          partyUrns: mockPartyUrns,
        });

        // Assert
        expect(result).toEqual([]);
      });
    });
  });

  describe('when isEwcsFacility is true', () => {
    const isBssFacility = false;
    const isCashFacility = false;
    const isContingentFacility = false;
    const isEwcsFacility = true;

    describe('when partyUrns.issuingBank exists', () => {
      it(`should return an array with an "${COUNTERPARTY_ROLE_CODE.ISSUING_BANK}" counterparty`, () => {
        // Arrange
        const mockPartyUrns = {
          issuingBank: '00318345',
        };

        // Act
        const result = mapCounterparties({
          isBssFacility,
          isCashFacility,
          isContingentFacility,
          isEwcsFacility,
          partyUrns: mockPartyUrns,
        });

        // Assert
        const expected = [
          {
            counterpartyUrn: mockPartyUrns.issuingBank,
            roleCode: COUNTERPARTY_ROLE_CODE.ISSUING_BANK,
          },
        ];

        expect(result).toEqual(expected);
      });
    });

    describe('when partyUrns.issuingBank does NOT exist but partyUrns.buyer exists', () => {
      it(`should return an array with a "${COUNTERPARTY_ROLE_CODE.EWCS.BUYER}" counterparty`, () => {
        // Arrange
        const mockPartyUrns = {
          buyer: '00445566',
        };

        // Act
        const result = mapCounterparties({
          isBssFacility,
          isCashFacility,
          isContingentFacility,
          isEwcsFacility,
          partyUrns: mockPartyUrns,
        });

        // Assert
        const expected = [
          {
            counterpartyUrn: mockPartyUrns.buyer,
            roleCode: COUNTERPARTY_ROLE_CODE.EWCS.BUYER,
          },
        ];

        expect(result).toEqual(expected);
      });
    });

    describe('when neither partyUrns.issuingBank nor partyUrns.buyer exist', () => {
      it('should return an empty array', () => {
        // Act
        const result = mapCounterparties({
          isBssFacility,
          isCashFacility,
          isContingentFacility,
          isEwcsFacility,
          partyUrns: {},
        });

        // Assert
        expect(result).toEqual([]);
      });
    });
  });

  describe('when all flags are false', () => {
    const isCashFacility = false;
    const isBssFacility = false;
    const isContingentFacility = false;
    const isEwcsFacility = false;

    it('should return an empty array', () => {
      // Act
      const result = mapCounterparties({
        isBssFacility,
        isCashFacility,
        isContingentFacility,
        isEwcsFacility,
        partyUrns: {},
      });

      // Assert
      expect(result).toEqual([]);
    });
  });
});
