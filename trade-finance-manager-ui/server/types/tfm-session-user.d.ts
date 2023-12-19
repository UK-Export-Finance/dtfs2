import { TeamId } from './team-id';
import { UnixTimestamp } from './date';

export type TfmSessionUser = {
  _id: string;
  username: string;
  email: string;
  teams: TeamId[];
  timezone: string;
  firstName: string;
  lastName: string;
  status: string;
  lastLogin: UnixTimestamp;
};
