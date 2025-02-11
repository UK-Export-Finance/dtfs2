import { TFM_USER_SCHEMA } from './tfm-user.schema';
import { OBJECT_ID_STRING } from '../object-id';

export const TFM_SESSION_USER_SCHEMA = TFM_USER_SCHEMA.pick({
  username: true,
  email: true,
  teams: true,
  timezone: true,
  firstName: true,
  lastName: true,
  status: true,
  lastLogin: true,
}).extend({ _id: OBJECT_ID_STRING }); // _id is extended as a string as opposed to objectId due to existing implementation of TFM session user
