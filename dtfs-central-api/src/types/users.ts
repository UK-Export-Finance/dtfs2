import { Team } from './tfm/teams';

export type TfmUser = {
  username: string;
  email: string;
  teams: Team[];
  timezone: string;
  firstName: string;
  lastName: string;
};
