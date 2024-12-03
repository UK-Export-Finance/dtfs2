import { TeamId, UnixTimestampMilliseconds } from '@ukef/dtfs2-common';

export type TfmSessionUser = {
  _id: string;
  username: string;
  email: string;
  teams: TeamId[];
  timezone: string;
  firstName: string;
  lastName: string;
  status: string;
  lastLogin: UnixTimestampMilliseconds;
};
