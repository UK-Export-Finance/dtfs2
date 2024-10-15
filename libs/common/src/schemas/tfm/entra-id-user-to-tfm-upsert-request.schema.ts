import { ENTRA_ID_USER_SCHEMA } from './entra-id-user.schema';
import { USER_UPSERT_REQUEST_SCHEMA } from './user-upsert-request.schema';

export const ENTRA_ID_USER_TO_TFM_UPSERT_REQUEST_SCHEMA = ENTRA_ID_USER_SCHEMA.transform((entraIdUser) => ({
  azureOid: entraIdUser.oid,
  email: entraIdUser.verified_primary_email[0],
  username: entraIdUser.verified_primary_email[0],
  teams: entraIdUser.groups, // TODO: DTFS2-6892: This should be mapped
  timezone: 'Europe/London',
  firstName: entraIdUser.given_name,
  lastName: entraIdUser.family_name,
})).pipe(USER_UPSERT_REQUEST_SCHEMA);
