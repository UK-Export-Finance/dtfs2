import { TfmUser } from '@ukef/dtfs2-common';

export type GetUserResponse = { found: false } | { found: true; canProceed: false } | { found: true; canProceed: true; user: TfmUser };
