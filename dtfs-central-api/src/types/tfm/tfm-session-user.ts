import { Prettify, TfmUser } from '@ukef/dtfs2-common';

export type TfmSessionUser = Prettify<
  Pick<TfmUser, 'username' | 'email' | 'teams' | 'timezone' | 'firstName' | 'lastName' | 'lastLogin'> & {
    _id: string;
  }
>;
