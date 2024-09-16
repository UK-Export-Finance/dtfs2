import { TeamId } from '@ukef/dtfs2-common';

/**
 * Users returned by the test user fluent builder
 */
export type TestUser = {
  _id?: string;
  username: string;
  password: string;
  email: string;
  teams: TeamId[];
  timezone: string;
  firstName: string;
  lastName: string;
  token: string;
};
