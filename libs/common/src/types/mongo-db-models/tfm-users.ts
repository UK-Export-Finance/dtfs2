import { WithId } from 'mongodb';
import { TeamId } from '../tfm/team-id';
import { UnixTimestamp } from '../date';

export type TfmUser = WithId<{
  username: string;
  email: string;
  teams: TeamId[];
  timezone: string;
  firstName: string;
  lastName: string;
  salt: string;
  hash: string;
  status: string;
  lastLogin?: UnixTimestamp;
  loginFailureCount?: number;
  sessionIdentifier?: string;
}>;
