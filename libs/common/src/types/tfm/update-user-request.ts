import { z } from 'zod';
import { UPDATE_USER_REQUEST_SCHEMA } from '../../schemas';

/**
 * User upsert request used during SSO login
 */
export type UpdateUserRequest = z.infer<typeof UPDATE_USER_REQUEST_SCHEMA>;
