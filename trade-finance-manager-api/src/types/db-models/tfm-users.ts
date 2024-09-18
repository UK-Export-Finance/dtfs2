import { WithId } from 'mongodb';
import { TeamId } from '../team-id';

export type TfmUserMappedFromEntraUser = {
  azureOid: string;
  username: string;
  email: string;
  teams: TeamId[];
  timezone: string;
  firstName: string;
  lastName: string;
};

export type TfmUser = WithId<{
  azureOid: string;
  username: string;
  email: string;
  teams: TeamId[];
  timezone: string;
  firstName: string;
  lastName: string;
  lastLogin?: number;
  sessionIdentifier?: string;
}>;
