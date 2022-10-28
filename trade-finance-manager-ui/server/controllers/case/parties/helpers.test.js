import { userCanEdit, bondPartyType, isBondPartyType, constructErrRef } from './helpers';

describe('case - parties - helpers', () => {
  describe('userCanEdit', () => {
    it('should return true', () => {
      const result = userCanEdit({
        firstName: 'Joe',
        lastName: 'Bloggs',
        teams: ['BUSINESS_SUPPORT'],
      });

      expect(result).toEqual(true);
    });

    describe('when user is NOT in BUSINESS_SUPPORT team', () => {
      it('should return false', () => {
        const result = userCanEdit({
          firstName: 'Joe',
          lastName: 'Bloggs',
          teams: ['UNDERWRITERS'],
        });

        expect(result).toEqual(false);
      });
    });
  });

  describe('bondPartyType()', () => {
    it('should return bondBeneficiaryPartyUrn and bonds-beneficiary if body contains bondBeneficiaryPartyUrn', () => {
      const body = {
        bondBeneficiaryPartyUrn: ['123'],
      };

      const response = bondPartyType(body);

      expect(response.bodyType).toEqual('bondBeneficiaryPartyUrn');
      expect(response.partyType).toEqual('bonds-beneficiary');
    });

    it('should return bondIssuerPartyUrn and bonds-issuer if body does not contain bondBeneficiaryPartyUrn', () => {
      const body = {
        bondIssuerPartyUrn: ['123'],
      };

      const response = bondPartyType(body);

      expect(response.bodyType).toContain('bondIssuerPartyUrn');
      expect(response.partyType).toContain('bonds-issuer');
    });
  });

  describe('isBondPartyType()', () => {
    it('should return true if party type is bondBeneficiaryPartyUrn', () => {
      const response = isBondPartyType('bondBeneficiaryPartyUrn');

      expect(response).toEqual(true);
    });

    it('should return true if party type is bondIssuerPartyUrn', () => {
      const response = isBondPartyType('bondIssuerPartyUrn');

      expect(response).toEqual(true);
    });

    it('should return true if party type is bondBeneficiaryPartyUrn', () => {
      const response = isBondPartyType('bondBeneficiaryPartyUrn');

      expect(response).toEqual(true);
    });

    it('should return true if party type is exporter', () => {
      const response = isBondPartyType('exporter');

      expect(response).toEqual(false);
    });

    it('should return true if party type is agent', () => {
      const response = isBondPartyType('agent');

      expect(response).toEqual(false);
    });
  });

  describe('constructErrRef()', () => {
    it('should return `partyUrn` if partyType is exporter', () => {
      const response = constructErrRef('exporter', null);

      expect(response).toEqual('partyUrn');
    });

    it('should return `partyUrn-1` if partyType is bondBeneficiaryPartyUrn and index 1', () => {
      const response = constructErrRef('bondBeneficiaryPartyUrn', 1);

      expect(response).toEqual('partyUrn-1');
    });

    it('should return `partyUrn-2` if partyType is bondBeneficiaryPartyUrn and index 2', () => {
      const response = constructErrRef('bondBeneficiaryPartyUrn', 2);

      expect(response).toEqual('partyUrn-2');
    });

    it('should return `partyUrn-1` if partyType is bondIssuerPartyUrn and index 1', () => {
      const response = constructErrRef('bondIssuerPartyUrn', 1);

      expect(response).toEqual('partyUrn-1');
    });

    it('should return `partyUrn-2` if partyType is bondIssuerPartyUrn and index 2', () => {
      const response = constructErrRef('bondIssuerPartyUrn', 2);

      expect(response).toEqual('partyUrn-2');
    });
  });
});
