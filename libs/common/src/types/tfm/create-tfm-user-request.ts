import { z } from 'zod';
import { CREATE_TFM_USER_REQUEST_SCHEMA } from '../../schemas';

/**
 * User create request used during SSO login
 * @see CREATE_TFM_USER_REQUEST_SCHEMA for documentation
 */
export type CreateTfmUserRequest = z.infer<typeof CREATE_TFM_USER_REQUEST_SCHEMA>;
