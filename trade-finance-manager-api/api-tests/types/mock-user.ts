import { TeamId } from '@ukef/dtfs2-common';

export type MockUser = {
  _id: string;
  username: string;
  password: string;
  email: string;
  teams: TeamId[];
  timezone: string;
  firstName: string;
  lastName: string;
  token: string;
};
