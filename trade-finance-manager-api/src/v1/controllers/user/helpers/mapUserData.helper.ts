import { TfmUser } from '@ukef/dtfs2-common';
import { TfmSessionUser } from '../../../../types/tfm-session-user';

export const mapUserData = (user: TfmUser): TfmSessionUser => ({
  _id: user._id.toString(),
  username: user.username,
  email: user.email,
  teams: user.teams,
  timezone: user.timezone,
  firstName: user.firstName,
  lastName: user.lastName,
  lastLogin: user.lastLogin,
});
