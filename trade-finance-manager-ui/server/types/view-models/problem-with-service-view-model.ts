import { TfmSessionUser } from '../tfm-session-user';

export type ProblemWithServiceViewModel = {
  reason: string;
  reportId: string;
  user?: TfmSessionUser;
};
