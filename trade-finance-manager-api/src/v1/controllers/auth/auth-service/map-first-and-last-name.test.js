const { mapFirstAndLastName } = require('./map-first-and-last-name');
const MOCK_ENTRA_USER = require('../../../__mocks__/mock-entra-user');
const { MOCK_TFM_SESSION_USER } = require('../../../__mocks__/mock-tfm-session-user');


describe('auth-service/map-first-and-last-name', () => {
  const entraClaimsWithNullForNames = { ...MOCK_ENTRA_USER.idTokenClaims, ...{ given_name: null, family_name: null }};

  describe('mapFirstAndLastName', () => {
    it('returns a firstName and lastName from Entra claims', () => {
      const result = mapFirstAndLastName(MOCK_ENTRA_USER.idTokenClaims, MOCK_TFM_SESSION_USER);

      const expected = { firstName: 'Sarah', lastName: 'Walker' };

      expect(result).toEqual(expected);
    });

    it('returns a firstName and lastName from session user', () => {
      const result = mapFirstAndLastName(entraClaimsWithNullForNames, MOCK_TFM_SESSION_USER);

      const expected = { firstName: 'Test', lastName: 'User' };

      expect(result).toEqual(expected);
    });


    it('returns default firstName and lastName', () => {
      const result = mapFirstAndLastName(entraClaimsWithNullForNames, {...MOCK_TFM_SESSION_USER, ...{ firstName: null, lastName: null}});

      const expected = { firstName: 'No name', lastName: 'No surname' };

      expect(result).toEqual(expected);
    });

    it('returns default firstName and lastName for undefined fields', () => {
      const result = mapFirstAndLastName({}, {});

      const expected = { firstName: 'No name', lastName: 'No surname' };

      expect(result).toEqual(expected);
    });

    it('returns default firstName and lastName for empty strings', () => {
      const result = mapFirstAndLastName({...MOCK_ENTRA_USER.idTokenClaims, ...{ given_name: '', family_name: '' }}, {...MOCK_TFM_SESSION_USER, ...{ firstName: '', lastName: ''}});

      const expected = { firstName: 'No name', lastName: 'No surname' };

      expect(result).toEqual(expected);
    });

    it('returns a first name from session user and lastName from Entra claims', () => {
      const result = mapFirstAndLastName({ ...MOCK_ENTRA_USER.idTokenClaims, ...{ given_name: null }}, MOCK_TFM_SESSION_USER);

      const expected = { firstName: 'Test', lastName: 'Walker' };

      expect(result).toEqual(expected);
    });

    it('returns a first name from Entra claims and lastName from session user', () => {
      const result = mapFirstAndLastName({ ...MOCK_ENTRA_USER.idTokenClaims, ...{ family_name: null }}, MOCK_TFM_SESSION_USER);

      const expected = { firstName: 'Sarah', lastName: 'User' };

      expect(result).toEqual(expected);
    });

    it('returns default first name and lastName from Entra claims', () => {
      const result = mapFirstAndLastName({ ...MOCK_ENTRA_USER.idTokenClaims, ...{ given_name: null }}, { ...MOCK_TFM_SESSION_USER, ...{ firstName: null }});

      const expected = { firstName: 'No name', lastName: 'Walker' };

      expect(result).toEqual(expected);
    });

    it('returns first name from Entra claims and default lastName', () => {
      const result = mapFirstAndLastName({ ...MOCK_ENTRA_USER.idTokenClaims, ...{ family_name: null }}, { ...MOCK_TFM_SESSION_USER, ...{ lastName: null}});

      const expected = { firstName: 'Sarah', lastName: 'No surname' };

      expect(result).toEqual(expected);
    });
  });
});
