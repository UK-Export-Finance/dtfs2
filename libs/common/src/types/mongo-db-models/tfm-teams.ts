import { WithId } from 'mongodb';
import { TeamId } from '@ukef/types/tfm/team-id';

export type TfmTeam = WithId<{
  id: TeamId;
  name: string;
  email: string;
}>;
