import { z } from 'zod';
import { UPDATE_TFM_USER_REQUEST_SCHEMA } from '../../schemas';

/**
 * User update request used during SSO login
 * @see UPDATE_TFM_USER_REQUEST_SCHEMA for documentation
 */
export type UpdateTfmUserRequest = z.infer<typeof UPDATE_TFM_USER_REQUEST_SCHEMA>;
