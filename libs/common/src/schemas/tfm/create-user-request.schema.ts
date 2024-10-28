import z from 'zod';
import { TfmTeamSchema } from './tfm-team.schema';
import { UNIX_TIMESTAMP_MILLISECONDS_SCHEMA } from '../unix-timestamp.schema';

/**
 * Used during the SSO login process when a user is required to be created in TFM
 * It is used as a foundation to the upsert user request
 * @see UPSERT_USER_REQUEST_SCHEMA for the upsert user request schema this create user request schema influences
 * @see UPDATE_USER_REQUEST_SCHEMA for the update user schema this create user request schema influences
 */
export const CREATE_USER_REQUEST_SCHEMA = z.object({
  azureOid: z.string(),
  email: z.string(),
  username: z.string(),
  teams: z.array(TfmTeamSchema),
  timezone: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  lastLogin: UNIX_TIMESTAMP_MILLISECONDS_SCHEMA,
});
