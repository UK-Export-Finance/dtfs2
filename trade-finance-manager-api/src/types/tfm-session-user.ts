import { TfmUser } from './db-models/tfm-users';

export type TfmSessionUser = Pick<
  TfmUser,
  'username' | 'email' | 'teams' | 'timezone' | 'firstName' | 'lastName' | 'status' | 'lastLogin'
> & {
  _id: string;
};
