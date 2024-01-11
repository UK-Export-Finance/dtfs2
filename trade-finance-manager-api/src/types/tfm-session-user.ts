import { TfmUser } from './db-models/tfm-users';

export type TfmSessionUser = Omit<TfmUser, 'salt' | 'hash' | 'loginFailureCount' | 'sessionIdentifier' | '_id'> & {
  _id: string;
};
