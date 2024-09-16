import { TfmUser } from '../db-models/tfm-users';

export type GetUserResponse = { found: false } | { found: true; canProceed: false } | { found: true; canProceed: true; user: TfmUser };
