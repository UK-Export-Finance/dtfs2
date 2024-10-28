import { z } from 'zod';
import { UPSERT_USER_REQUEST_SCHEMA } from '../../schemas';

/**
 * User upsert request used during SSO login
 */
export type UpsertUserRequest = z.infer<typeof UPSERT_USER_REQUEST_SCHEMA>;
