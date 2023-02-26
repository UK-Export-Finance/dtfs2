import {
  userCanEdit,
  bondPartyType,
  isBondPartyType,
  constructErrRef,
  isEmptyString,
  partyType,
} from './helpers';

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

  describe('isEmptyString()', () => {
    it('should return `true` if string is empty', () => {
      const response = isEmptyString('');

      expect(response).toEqual(true);
    });

    it('should return `false` if string has letters', () => {
      const response = isEmptyString('a');

      expect(response).toEqual(false);
    });

    it('should return `false` if string has numbers', () => {
      const response = isEmptyString('1');

      expect(response).toEqual(false);
    });

    it('should return `true` if string has space only', () => {
      const response = isEmptyString(' ');

      expect(response).toEqual(true);
    });

    it('should return `true` if string has tab only', () => {
      const response = isEmptyString('  ');

      expect(response).toEqual(true);
    });
  });

  describe('partyType()', () => {
    it('Should return `false` when URL is empty', () => {
      const url = '';
      const response = partyType(url);

      expect(response).toEqual(false);
    });

    it('Should return `false` when URL is `null`', () => {
      const url = null;
      const response = partyType(url);

      expect(response).toEqual(false);
    });

    it('Should return `false` when URL is `undefined`', () => {
      const url = undefined;
      const response = partyType(url);

      expect(response).toEqual(false);
    });

    it('Should return `false` when URL has empty spaces', () => {
      const url = '  ';
      const response = partyType(url);

      expect(response).toEqual(false);
    });

    it('Should return `false` when URL is an not string', () => {
      const url = [];
      const response = partyType(url);

      expect(response).toEqual(false);
    });

    it('Should return `false` when URL is an not string', () => {
      const url = 123.123;
      const response = partyType(url);

      expect(response).toEqual(false);
    });

    it('Should return empty string when URL has unidentified party', () => {
      const url = '/abc1233/party/unidentified';
      const response = partyType(url);

      expect(response).toEqual('');
    });

    it('Should return the party name (exporter)', () => {
      const url = '/abc1233/party/exporter';
      const response = partyType(url);

      expect(response).toEqual('exporter');
    });

    it('Should return the party name (buyer)', () => {
      const url = '/abc1233/party/buyer';
      const response = partyType(url);

      expect(response).toEqual('buyer');
    });

    it('Should return the party name (agent)', () => {
      const url = '/abc1233/party/agent/confirm';
      const response = partyType(url);

      expect(response).toEqual('agent');
    });

    it('Should return the party name (indemnifier)', () => {
      const url = '/abc1233/indemnifier/confirm/post';
      const response = partyType(url);

      expect(response).toEqual('indemnifier');
    });

    it('Should return the party name (bond-issuer)', () => {
      const url = '/abc1233/party/bond-issuer';
      const response = partyType(url);

      expect(response).toEqual('bond-issuer');
    });

    it('Should return the party name (bond-beneficiary)', () => {
      const url = '/abc1233/party/bond-beneficiary';
      const response = partyType(url);

      expect(response).toEqual('bond-beneficiary');
    });

    it('Should return the party name in lower case', () => {
      const url = '/abc1233/party/ExPorTeR/confirm/post';
      const response = partyType(url);

      expect(response).toEqual('exporter');
    });
  });
});
