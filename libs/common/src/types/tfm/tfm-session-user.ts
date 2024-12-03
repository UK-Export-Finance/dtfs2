import { UnixTimestampMilliseconds } from '../date';
import { TeamId } from './team-id';

// update TFM ui to use this type
export type TfmSessionUser = {
  _id: string;
  username: string;
  email: string;
  teams: TeamId[];
  timezone: string;
  firstName: string;
  lastName: string;
  status: string;
  lastLogin: UnixTimestampMilliseconds;
};
