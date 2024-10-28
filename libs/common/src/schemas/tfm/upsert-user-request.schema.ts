import { CREATE_USER_REQUEST_SCHEMA } from './create-user-request.schema';

/**
 * Used during the SSO login process when a user is required to be upserted in TFM
 * AS this upsert may require the creation of the user, it is directly based on the create user request
 * @see CREATE_USER_REQUEST_SCHEMA for the create user request schema this update user request schema is based on
 */
export const UPSERT_USER_REQUEST_SCHEMA = CREATE_USER_REQUEST_SCHEMA;
