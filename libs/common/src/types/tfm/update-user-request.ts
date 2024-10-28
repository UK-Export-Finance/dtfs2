import { z } from 'zod';
import { UPDATE_USER_REQUEST_SCHEMA } from '../../schemas';

/**
 * User update request used during SSO login
 * @see UPDATE_USER_REQUEST_SCHEMA for documentation
 */
export type UpdateUserRequest = z.infer<typeof UPDATE_USER_REQUEST_SCHEMA>;
