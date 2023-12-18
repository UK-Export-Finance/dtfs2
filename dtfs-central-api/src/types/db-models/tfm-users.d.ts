import { WithId } from 'mongodb';
import { TeamId } from '../tfm/team';

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
  lastLogin?: number;
  loginFailureCount?: number;
  sessionIdentifier?: string;
}>;
