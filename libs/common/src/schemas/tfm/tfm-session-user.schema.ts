import { TFM_USER_SCHEMA } from './tfm-user.schema';

export const TFM_SESSION_USER_SCHEMA = TFM_USER_SCHEMA.pick({
  _id: true,
  username: true,
  email: true,
  teams: true,
  timezone: true,
  firstName: true,
  lastName: true,
  status: true,
  lastLogin: true,
});
