import { z } from 'zod';
import { UPSERT_TFM_USER_REQUEST_SCHEMA } from '../../schemas';

/**
 * User upsert request used during SSO login
 * @see UPSERT_TFM_USER_REQUEST_SCHEMA for documentation
 */
export type UpsertTfmUserRequest = z.infer<typeof UPSERT_TFM_USER_REQUEST_SCHEMA>;
