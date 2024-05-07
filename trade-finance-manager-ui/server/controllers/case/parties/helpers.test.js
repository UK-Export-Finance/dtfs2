import { TEAM_IDS } from '@ukef/dtfs2-common';
import { userCanEdit, bondType, isBondPartyType, constructErrRef, isEmptyString, partyType } from './helpers';

describe('case - parties - helpers', () => {
  describe('userCanEdit', () => {
    it('should return true', () => {
      const result = userCanEdit({
        firstName: 'Joe',
        lastName: 'Bloggs',
        teams: [TEAM_IDS.BUSINESS_SUPPORT],
      });

      expect(result).toEqual(true);
    });

    describe('when user is NOT in BUSINESS_SUPPORT team', () => {
      it('should return false', () => {
        const result = userCanEdit({
          firstName: 'Joe',
          lastName: 'Bloggs',
          teams: [TEAM_IDS.UNDERWRITERS],
        });

        expect(result).toEqual(false);
      });
    });
  });

  describe('bondType()', () => {
    it('should return `bondIssuerPartyUrn`', () => {
      const response = bondType('bond-issuer');

      expect(response).toEqual('bondIssuerPartyUrn');
    });

    it('should return `bondBeneficiaryPartyUrn`', () => {
      const response = bondType('bond-beneficiary');

      expect(response).toEqual('bondBeneficiaryPartyUrn');
    });

    it('should return `bondBeneficiaryPartyUrn`', () => {
      const response = bondType('ABC123');

      expect(response).toEqual('bondBeneficiaryPartyUrn');
    });

    it('should return `bondBeneficiaryPartyUrn`', () => {
      const response = bondType('ABC');

      expect(response).toEqual('bondBeneficiaryPartyUrn');
    });

    it('should return `bondBeneficiaryPartyUrn`', () => {
      const response = bondType('123');

      expect(response).toEqual('bondBeneficiaryPartyUrn');
    });

    it('should return `bondBeneficiaryPartyUrn`', () => {
      const response = bondType('');

      expect(response).toEqual('bondBeneficiaryPartyUrn');
    });

    it('should return `bondBeneficiaryPartyUrn`', () => {
      const response = bondType(null);

      expect(response).toEqual('bondBeneficiaryPartyUrn');
    });

    it('should return `bondBeneficiaryPartyUrn`', () => {
      const response = bondType(undefined);

      expect(response).toEqual('bondBeneficiaryPartyUrn');
    });
  });

  describe('isBondPartyType()', () => {
    it('should return true if party type is bondBeneficiaryPartyUrn', () => {
      const response = isBondPartyType('bond-beneficiary');

      expect(response).toEqual(true);
    });

    it('should return true if party type is bondIssuerPartyUrn', () => {
      const response = isBondPartyType('bond-issuer');

      expect(response).toEqual(true);
    });

    it('should return true if party type is bondBeneficiaryPartyUrn', () => {
      const response = isBondPartyType('bond-beneficiary');

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

    it('should return true if party type is buyer', () => {
      const response = isBondPartyType('buyer');

      expect(response).toEqual(false);
    });

    it('should return true if party type is indemnifier', () => {
      const response = isBondPartyType('indemnifier');

      expect(response).toEqual(false);
    });

    it('should return true if party type is blank', () => {
      const response = isBondPartyType('');

      expect(response).toEqual(false);
    });
  });

  describe('constructErrRef()', () => {
    it('should return `partyUrn` if partyType is blank', () => {
      const response = constructErrRef('', null);

      expect(response).toEqual('partyUrn');
    });

    it('should return `partyUrn` if partyType is exporter', () => {
      const response = constructErrRef('exporter', null);

      expect(response).toEqual('partyUrn');
    });

    it('should return `partyUrn` if partyType is buyer', () => {
      const response = constructErrRef('buyer', null);

      expect(response).toEqual('partyUrn');
    });

    it('should return `partyUrn` if partyType is agent', () => {
      const response = constructErrRef('agent', null);

      expect(response).toEqual('partyUrn');
    });

    it('should return `partyUrn` if partyType is indemnifier', () => {
      const response = constructErrRef('indemnifier', null);

      expect(response).toEqual('partyUrn');
    });

    it('should return `partyUrn-1` if partyType is bond-beneficiary and index 1', () => {
      const response = constructErrRef('bond-beneficiary', 1);

      expect(response).toEqual('partyUrn-1');
    });

    it('should return `partyUrn-2` if partyType is bond-beneficiary and index 2', () => {
      const response = constructErrRef('bond-beneficiary', 2);

      expect(response).toEqual('partyUrn-2');
    });

    it('should return `partyUrn-1` if partyType is bond-issuer and index 1', () => {
      const response = constructErrRef('bond-issuer', 1);

      expect(response).toEqual('partyUrn-1');
    });

    it('should return `partyUrn-2` if partyType is bond-issuer and index 2', () => {
      const response = constructErrRef('bond-issuer', 2);

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

    it('Should return `false` when URL is an array', () => {
      const url = [];
      const response = partyType(url);

      expect(response).toEqual(false);
    });

    it('Should return `false` when URL is a number', () => {
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
      const url = '/abc1233/indemnifier/summary/post';
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
      const url = '/abc1233/party/ExPorTeR/summary/post';
      const response = partyType(url);

      expect(response).toEqual('exporter');
    });
  });
});
