import { TFM_USER_SCHEMA } from './tfm-user.schema';

// TODO update docs, tests
/**
 * Used during the SSO login process when a user is required to be created in TFM
 * It is used as a foundation to the upsert user request
 * @see UPSERT_TFM_USER_REQUEST_SCHEMA for the upsert user request schema this create user request schema influences
 * @see UPDATE_TFM_USER_REQUEST_SCHEMA for the update user schema this create user request schema influences
 */
export const CREATE_TFM_USER_REQUEST_SCHEMA = TFM_USER_SCHEMA.pick({
  username: true,
  email: true,
  teams: true,
  timezone: true,
  firstName: true,
  lastName: true,
  azureOid: true,
}).required();
