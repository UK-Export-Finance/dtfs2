import { TfmUser } from './db-models/tfm-users';

export type TfmSessionUser = Pick<TfmUser, 'username' | 'email' | 'teams' | 'timezone' | 'firstName' | 'lastName' | 'lastLogin'> & {
  _id: string;
};
