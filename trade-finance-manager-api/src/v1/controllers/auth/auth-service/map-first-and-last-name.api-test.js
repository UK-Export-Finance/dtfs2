const { mapName, mapFirstAndLastName } = require('./map-first-and-last-name');
const MOCK_ENTRA_USER = require('../../../__mocks__/mock-entra-user');

// TODO: is there a generic mock we can use for this?
const mockTfmUser = {
  firstName: 'First',
  lastName: 'Last',
};

const mockEntraPropertyName = 'given_name';
const mockTfmPropertyName = 'firstName';
const mockDefaultCopy = 'No name';

const baseParams = {
  entraUser: MOCK_ENTRA_USER.idTokenClaims,
  entraPropertyName: mockEntraPropertyName,
  tfmUser: mockTfmUser,
  tfmPropertyName: mockTfmPropertyName,
  defaultCopy: mockDefaultCopy,
};

describe('auth-service/map-first-and-last-name', () => {
  describe('mapName', () => {
    describe('when Entra user data has a value from the provided entraPropertyName', () => {
      it('returns the value', () => {
        const result = mapName(baseParams);

        const expected = MOCK_ENTRA_USER.idTokenClaims[mockEntraPropertyName];

        expect(result).toEqual(expected);
      });
    });

    describe('when Entra user data does NOT have a value from the provided entraPropertyName', () => {
      describe('when TFM user data has a value from the provided tfmPropertyName', () => {
        it('returns the value', () => {
          const result = mapName({
            ...baseParams,
            entraUser: MOCK_ENTRA_USER.idTokenClaims,
            entraPropertyName: '',
          });

          const expected = mockTfmUser[mockTfmPropertyName];

          expect(result).toEqual(expected);
        });
      });

      describe('when TFM user data does NOT has a value from the provided tfmPropertyName', () => {
        it('returns the the provided defaultCopy', () => {
          const result = mapName({
            ...baseParams,
            entraUser: MOCK_ENTRA_USER.idTokenClaims,
            entraPropertyName: '',
            tfmPropertyName: '',
          });

          const expected = mockDefaultCopy;

          expect(result).toEqual(expected);
        });
      });
    });
  });

  describe('mapFirstAndLastName', () => {
    it('returns a firstName and lastName via mapName function', () => {
      const result = mapFirstAndLastName(MOCK_ENTRA_USER.idTokenClaims, mockTfmUser);

      const expected = {
        firstName: mapName({
          entraUser: MOCK_ENTRA_USER.idTokenClaims,
          tfmUser: mockTfmUser,
          entraPropertyName: 'given_name',
          tfmPropertyName: 'firstName',
          defaultCopy: 'No name',
        }),
        lastName: mapName({
          entraUser: MOCK_ENTRA_USER.idTokenClaims,
          tfmUser: mockTfmUser,
          entraPropertyName: 'family_name',
          tfmPropertyName: 'lastName',
          defaultCopy: 'No surname',
        }),
      };

      expect(result).toEqual(expected);
    });
  });
});
