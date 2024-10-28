import { z } from 'zod';
import { CREATE_USER_REQUEST_SCHEMA } from '../../schemas';

/**
 * User create request used during SSO login
 * @see CREATE_USER_REQUEST_SCHEMA for documentation
 */
export type CreateUserRequest = z.infer<typeof CREATE_USER_REQUEST_SCHEMA>;
