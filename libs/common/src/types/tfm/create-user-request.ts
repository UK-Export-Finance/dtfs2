import { z } from 'zod';
import { CREATE_USER_REQUEST_SCHEMA } from '../../schemas';

/**
 * User upsert request used during SSO login
 */
export type CreateUserRequest = z.infer<typeof CREATE_USER_REQUEST_SCHEMA>;
