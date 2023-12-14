import { TfmUser } from "../db-models/tfm-user";

export type TfmSessionUser = Omit<TfmUser,
  | 'salt'
  | 'hash'
  | 'loginFailureCount'
  | 'sessionIdentifier'>;
