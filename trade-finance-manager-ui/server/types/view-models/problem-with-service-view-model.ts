import { TfmSessionUser } from '@ukef/dtfs2-common';

export type ProblemWithServiceViewModel = {
  reason: string;
  reportId: string;
  user?: TfmSessionUser;
};
