import { CREATE_TFM_USER_REQUEST_SCHEMA } from './create-tfm-user-request.schema';

/**
 * Used during the SSO login process when a user is required to be updated in TFM
 * It uses the create user request schema as a foundation
 * It is set as partial to allow for partial updates of a user in TFM
 * @see CREATE_TFM_USER_REQUEST_SCHEMA for the create user request schema this update user request schema is based on
 */
export const UPDATE_TFM_USER_REQUEST_SCHEMA = CREATE_TFM_USER_REQUEST_SCHEMA.partial();
