import { ACTIVITY_TYPES } from '@ukef/constants';
import { UnixTimestamp, UnixTimestampSeconds } from '@ukef/types/date';
import { ActivityAuthor } from './activity-author';

export type TfmActivity =
  | {
      type: typeof ACTIVITY_TYPES.ACTIVITY | typeof ACTIVITY_TYPES.COMMENT;
      timestamp: UnixTimestampSeconds;
      author: ActivityAuthor;
      text: string;
      label: string;
      facilityId?: string;
      amendmentId?: string;
    }
  | {
      type: typeof ACTIVITY_TYPES.CANCELLATION;
      timestamp: UnixTimestampSeconds;
      author: ActivityAuthor;
      bankRequestDate: UnixTimestamp;
      effectiveFrom: UnixTimestamp;
      reason: string;
    };
