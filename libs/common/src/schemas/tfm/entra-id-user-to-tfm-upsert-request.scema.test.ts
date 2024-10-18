import { aValidEntraIdUser } from '../../test-helpers';
import { EntraIdUser } from '../../types';
import { timezoneConfig } from '../timezone';
import { ENTRA_ID_USER_TO_TFM_UPSERT_REQUEST_SCHEMA } from './entra-id-user-to-tfm-upsert-request.schema';

describe('ENTRA_ID_USER_SCHEMA', () => {
  describe('when provided a valid entra id user', () => {
    const request = aValidEntraIdUser();
    itShouldReturnAValidaUserUpsertRequest(request);
  });

  describe('when provided a valid entra id user with extra fields', () => {
    const request = { ...aValidEntraIdUser(), extraField: 'extra-field' };
    itShouldReturnAValidaUserUpsertRequest(request);
  });

  describe('when provided with an empty entra id user', () => {
    const request = {};
    itShouldThrowAnError(request);
  });

  describe('when provided with a invalid entra id user with missing fields', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { roles, ...request } = aValidEntraIdUser();
    itShouldThrowAnError(request);
  });

  describe('when provided an invalid entra id user with incorrect fields', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const request = { ...aValidEntraIdUser(), roles: 1 };
    itShouldThrowAnError(request);
  });
});

function itShouldReturnAValidaUserUpsertRequest(request: EntraIdUser) {
  it('should return a valid user upsert request', () => {
    const result = ENTRA_ID_USER_TO_TFM_UPSERT_REQUEST_SCHEMA.parse(request);
    expect(result).toEqual({
      azureOid: request.oid,
      email: request.verified_primary_email[0],
      username: request.verified_primary_email[0],
      teams: request.roles,
      timezone: timezoneConfig.DEFAULT,
      firstName: request.given_name,
      lastName: request.family_name,
    });
  });
}

function itShouldThrowAnError(request: unknown) {
  it('should throw an error', () => {
    expect(() => ENTRA_ID_USER_TO_TFM_UPSERT_REQUEST_SCHEMA.parse(request)).toThrow();
  });
}
