import { Team } from './tfm/teams';

export type TFMUser = {
  username: string;
  email: string;
  teams: Team[];
  firstName: string;
  lastName: string;
};
