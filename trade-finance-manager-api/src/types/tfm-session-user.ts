import { TfmUser } from '@ukef/dtfs2-common';

export type TfmSessionUser = Pick<TfmUser, 'username' | 'email' | 'teams' | 'timezone' | 'firstName' | 'lastName' | 'status' | 'lastLogin'> & {
  _id: string;
};
