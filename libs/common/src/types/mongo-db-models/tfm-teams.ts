import { WithId } from 'mongodb';
import { TeamId } from '../tfm/team-id';

export type TfmTeam = WithId<{
  id: TeamId;
  name: string;
  email: string;
}>;
