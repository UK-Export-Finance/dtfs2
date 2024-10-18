/**
 * Represents user fields in the ID Token claims response from Entra ID.
 * Note: there are many more fields in the ID Token claims response, but these
 * are the only ones we care about
 */

import z from 'zod';
import { TfmTeamSchema } from './tfm-team.schema';

export const ENTRA_ID_USER_SCHEMA = z.object({
  oid: z.string(),
  verified_primary_email: z.array(z.string()),
  verified_secondary_email: z.array(z.string()),
  given_name: z.string(),
  family_name: z.string(),
  roles: z.array(TfmTeamSchema),
});
