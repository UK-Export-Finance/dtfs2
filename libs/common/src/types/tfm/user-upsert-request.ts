import { z } from 'zod';
import { USER_UPSERT_REQUEST_SCHEMA } from '../../schemas';

/**
 * User upsert request used during SSO login
 */
export type UserUpsertRequest = z.infer<typeof USER_UPSERT_REQUEST_SCHEMA>;
