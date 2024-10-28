import { timezoneConfig } from '../timezone';
import { ENTRA_ID_USER_SCHEMA } from './entra-id-user.schema';
import { UPSERT_USER_REQUEST_SCHEMA } from './upsert-user-request.schema';

export const ENTRA_ID_USER_TO_UPSERT_USER_REQUEST_SCHEMA = ENTRA_ID_USER_SCHEMA.transform((entraIdUser) => ({
  azureOid: entraIdUser.oid,
  email: entraIdUser.verified_primary_email[0],
  username: entraIdUser.verified_primary_email[0],
  teams: entraIdUser.roles,
  timezone: timezoneConfig.DEFAULT,
  firstName: entraIdUser.given_name,
  lastName: entraIdUser.family_name,
  lastLogin: Date.now(),
})).pipe(UPSERT_USER_REQUEST_SCHEMA);
