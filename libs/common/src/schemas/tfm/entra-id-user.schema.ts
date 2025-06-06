import z from 'zod';
import { ENTRA_ID_EMAIL_SCHEMA } from './entra-id-email.schema';
import { TfmTeamSchema } from './tfm-team.schema';

/**
 * Used during the SSO login process to upsert a user
 * This represents the user fields in the ID Token claims response from Entra ID.
 * Note: there are many more fields in the ID Token claims response, but these
 * are the only ones we care about
 * @see ENTRA_ID_USER_TO_UPSERT_TFM_USER_REQUEST_SCHEMA for the transformer to transform the Entra ID user to the upsert user request
 * @see UPSERT_TFM_USER_REQUEST_SCHEMA for the target upsert request schema
 */
export const ENTRA_ID_USER_SCHEMA = z.object({
  oid: z.string(),
  verified_primary_email: z.array(ENTRA_ID_EMAIL_SCHEMA),
  given_name: z.string(),
  family_name: z.string(),
  roles: z.array(TfmTeamSchema),
});
