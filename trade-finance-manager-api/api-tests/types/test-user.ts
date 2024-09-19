import { TfmUser } from '@ukef/dtfs2-common';

/**
 * Users returned by the test user fluent builder
 */
export interface TestUser extends Pick<TfmUser, 'username' | 'teams' | 'email' | 'timezone' | 'lastName' | 'firstName'> {
  _id?: string;
  token: string;
  password: string;
}
