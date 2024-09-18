import { WithId } from 'mongodb';
import { TeamId } from '../tfm/team-id';
import { UnixTimestamp } from '../date';

export type TfmUser = WithId<{
  /**
   * TODO: DTFS2-6892:
   * Consider whether AzureOid is optional because it is only added
   * when the user logs in for the first time with SSO.
   */
  azureOid?: string;
  username: string;
  email: string;
  teams: TeamId[];
  timezone: string;
  firstName: string;
  lastName: string;
  lastLogin?: UnixTimestamp;
  sessionIdentifier?: string;
}>;
