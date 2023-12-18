import { WithId } from 'mongodb';
import { Team } from '../tfm/teams';

export type TfmUser = WithId<{
  username: string;
  email: string;
  teams: Team[];
  timezone: string;
  firstName: string;
  lastName: string;
  salt: string;
  hash: string;
  status: string;
  lastLogin?: number;
  loginFailureCount?: number;
  sessionIdentifier?: string;
}>;
