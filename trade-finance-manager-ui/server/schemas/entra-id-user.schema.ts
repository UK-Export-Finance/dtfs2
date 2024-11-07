/**
 * Represents user fields in the ID Token claims response from Entra ID.
 * Note: there are many more fields in the ID Token claims response, but these
 * are the only ones we care about
 */

import z from 'zod';
import { ALL_ENTRA_ID_USER_GROUPS } from '../constants/entra-id-user-groups';

export const EntraIdUserSchema = z.object({
  oid: z.string(),
  verified_primary_email: z.array(z.string()),
  verified_secondary_email: z.array(z.string()),
  given_name: z.string(),
  family_name: z.string(),
  groups: z.array(z.enum(ALL_ENTRA_ID_USER_GROUPS)), // TODO: DTFS2-6892: this is using existing roles, but could be improved
});
