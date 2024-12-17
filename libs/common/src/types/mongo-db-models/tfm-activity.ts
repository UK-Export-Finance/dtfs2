import { ACTIVITY_TYPES } from '../../constants';
import { UnixTimestamp, UnixTimestampSeconds } from '../date';
import { ActivityAuthor } from './activity-author';

const { ACTIVITY, COMMENT, CANCELLATION } = ACTIVITY_TYPES;

export type TfmActivity =
  | {
      type: typeof ACTIVITY | typeof COMMENT;
      timestamp: UnixTimestampSeconds;
      author: ActivityAuthor;
      text: string;
      label: string;
    }
  | {
      type: typeof CANCELLATION;
      timestamp: UnixTimestampSeconds;
      author: ActivityAuthor;
      bankRequestDate: UnixTimestamp;
      effectiveFrom: UnixTimestamp;
      reason: string;
    };
