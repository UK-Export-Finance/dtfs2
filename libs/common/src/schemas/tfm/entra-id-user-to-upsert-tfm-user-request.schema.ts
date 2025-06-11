import { timezoneConfig } from '../timezone';
import { ENTRA_ID_USER_SCHEMA } from './entra-id-user.schema';
import { UPSERT_TFM_USER_REQUEST_SCHEMA } from './upsert-tfm-user-request.schema';

/**
 * Used during the SSO login process to upsert a user
 * This is the transformer to transform the Entra ID user to the upsert user request
 * @see ENTRA_ID_USER_SCHEMA for the Entra ID user schema received from Entra
 * @see UPSERT_TFM_USER_REQUEST_SCHEMA for the target upsert request schema
 */
export const ENTRA_ID_USER_TO_UPSERT_TFM_USER_REQUEST_SCHEMA = ENTRA_ID_USER_SCHEMA.transform((entraIdUser) => ({
  azureOid: entraIdUser.oid,
  email: entraIdUser.verified_primary_email[0],
  username: entraIdUser.verified_primary_email[0],
  teams: entraIdUser.roles,
  timezone: timezoneConfig.DEFAULT,
  firstName: entraIdUser.given_name,
  lastName: entraIdUser.family_name,
  lastLogin: Date.now(),
})).pipe(UPSERT_TFM_USER_REQUEST_SCHEMA);
