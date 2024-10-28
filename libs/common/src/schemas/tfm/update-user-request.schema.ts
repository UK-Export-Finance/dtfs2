import { CREATE_USER_REQUEST_SCHEMA } from './create-user-request.schema';

export const UPDATE_USER_REQUEST_SCHEMA = CREATE_USER_REQUEST_SCHEMA.partial();
