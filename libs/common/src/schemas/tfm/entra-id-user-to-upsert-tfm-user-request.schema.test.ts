import { afterAll } from '@jest/globals';
import { anEntraIdUser } from '../../test-helpers';
import { EntraIdUser } from '../../types';
import { timezoneConfig } from '../timezone';
import { ENTRA_ID_USER_TO_UPSERT_TFM_USER_REQUEST_SCHEMA } from './entra-id-user-to-upsert-tfm-user-request.schema';

describe('ENTRA_ID_USER_TO_TFM_UPSERT_REQUEST_SCHEMA', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('when provided a valid entra id user', () => {
    const request = anEntraIdUser();
    itShouldReturnAValidUpsertTfmUserRequest(request);
  });

  describe('when provided a valid entra id user with extra fields', () => {
    const request = { ...anEntraIdUser(), extraField: 'extra-field' };
    itShouldReturnAValidUpsertTfmUserRequest(request);
  });

  describe('when provided with an empty entra id user', () => {
    const request = {};
    itShouldThrowAnError(request);
  });

  describe('when provided with a invalid entra id user with missing fields', () => {
    const { roles: _roles, ...request } = anEntraIdUser();
    itShouldThrowAnError(request);
  });

  describe('when provided an invalid entra id user with incorrect fields', () => {
    const request = { ...anEntraIdUser(), roles: 1 };
    itShouldThrowAnError(request);
  });

  describe('when no primary email is provided', () => {
    const request = { ...anEntraIdUser(), verified_primary_email: [] };
    itShouldThrowAnError(request);
  });
});

function itShouldReturnAValidUpsertTfmUserRequest(request: EntraIdUser) {
  it('should return a valid user upsert request', () => {
    const result = ENTRA_ID_USER_TO_UPSERT_TFM_USER_REQUEST_SCHEMA.parse(request);
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
    expect(() => ENTRA_ID_USER_TO_UPSERT_TFM_USER_REQUEST_SCHEMA.parse(request)).toThrow();
  });
}
