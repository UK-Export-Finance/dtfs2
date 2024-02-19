import { Prettify } from '@ukef/dtfs2-common';
import { TfmUser } from '../db-models/tfm-users';

export type TfmSessionUser = Prettify<
  Pick<TfmUser, 'username' | 'email' | 'teams' | 'timezone' | 'firstName' | 'lastName' | 'status' | 'lastLogin'> & {
    _id: string;
  }
>;
