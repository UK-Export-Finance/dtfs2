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
  lastLogin?: UnixTimestamp;
  sessionIdentifier?: string;
}>;
