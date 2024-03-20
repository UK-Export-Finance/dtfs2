import { Prettify } from '../types-helper';
import { TfmUser } from '../db-models/tfm-users';

export type TfmSessionUser = Prettify<
  Pick<TfmUser, 'username' | 'email' | 'teams' | 'timezone' | 'firstName' | 'lastName' | 'lastLogin'> & {
    _id: string;
  }
>;
