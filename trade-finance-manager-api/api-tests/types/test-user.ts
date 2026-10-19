import { TfmUser } from '@ukef/dtfs2-common';

/**
 * Users returned by the test user fluent builder
 */
export type TestUser = {
  _id?: string;
  token: string;
  password: string;
} & Pick<TfmUser, 'username' | 'teams' | 'email' | 'timezone' | 'lastName' | 'firstName' | 'status'>;
