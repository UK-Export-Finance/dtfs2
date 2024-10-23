import z from 'zod';
import { TfmTeamSchema } from './tfm-team.schema';

export const USER_UPSERT_REQUEST_SCHEMA = z.object({
  azureOid: z.string(),
  email: z.string(),
  username: z.string(),
  teams: z.array(TfmTeamSchema),
  timezone: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  lastLogin: z.number().int().positive(), // unix timestamp
});
