import { APIM_GIFT_INTEGRATION } from '../../constants';
import { mapCounterparties } from '.';

const { DEFAULTS } = APIM_GIFT_INTEGRATION;

describe('mapCounterparties', () => {
  const startDate = '2024-01-28';
  const exitDate = '2026-02-14';

  describe('when isBssDeal is true', () => {
    const isBssDeal = true;

    describe(`when partyUrns.bondGiver exists`, () => {
      it('should return an array with a "BOND_GIVER" counterparty', () => {
        // Arrange
        const mockPartyUrns = {
          bondGiver: '00300130',
        };

        // Act
        const result = mapCounterparties({
          isBssDeal,
          partyUrns: mockPartyUrns,
          startDate,
          exitDate,
        });

        // Assert
        const expected = [
          {
            counterpartyUrn: mockPartyUrns.bondGiver,
            startDate,
            exitDate,
            roleCode: DEFAULTS.COUNTERPARTY_ROLE_CODE.BSS.BOND_GIVER,
          },
        ];

        expect(result).toEqual(expected);
      });
    });

    describe(`when partyUrns.bondBeneficiary exists`, () => {
      it('should return an array with a "BOND_BENEFICIARY" counterparty', () => {
        // Arrange
        const mockPartyUrns = {
          bondBeneficiary: '00318345',
        };

        // Act
        const result = mapCounterparties({
          isBssDeal,
          partyUrns: mockPartyUrns,
          startDate,
          exitDate,
        });

        // Assert
        const expected = [
          {
            counterpartyUrn: mockPartyUrns.bondBeneficiary,
            startDate,
            exitDate,
            roleCode: DEFAULTS.COUNTERPARTY_ROLE_CODE.BSS.BOND_BENEFICIARY,
          },
        ];

        expect(result).toEqual(expected);
      });
    });

    describe(`when both partyUrns.bondGiver and partyUrns.bondBeneficiary exist`, () => {
      it('should return an array with a "BOND_GIVER" counterparty and "BOND_BENEFICIARY" counterparty', () => {
        // Arrange
        const mockPartyUrns = {
          bondGiver: '00300130',
          bondBeneficiary: '00318345',
        };

        // Act
        const result = mapCounterparties({
          isBssDeal,
          partyUrns: mockPartyUrns,
          startDate,
          exitDate,
        });

        // Assert
        const expected = [
          {
            counterpartyUrn: mockPartyUrns.bondGiver,
            startDate,
            exitDate,
            roleCode: DEFAULTS.COUNTERPARTY_ROLE_CODE.BSS.BOND_GIVER,
          },
          {
            counterpartyUrn: mockPartyUrns.bondBeneficiary,
            startDate,
            exitDate,
            roleCode: DEFAULTS.COUNTERPARTY_ROLE_CODE.BSS.BOND_BENEFICIARY,
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
          isBssDeal,
          partyUrns: mockPartyUrns,
          startDate,
          exitDate,
        });

        // Assert
        expect(result).toEqual([]);
      });
    });
  });

  describe('when the isBssDeal is false', () => {
    const isBssDeal = false;

    it('should return an empty array', () => {
      // Act
      const result = mapCounterparties({
        isBssDeal,
        partyUrns: {},
        startDate,
        exitDate,
      });

      // Assert
      expect(result).toEqual([]);
    });
  });
});
