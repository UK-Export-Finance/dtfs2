import { ACTIVITY_TYPES } from '../../constants';
import { UnixTimestamp, UnixTimestampSeconds } from '../date';

export type TfmActivity =
  | {
      type: typeof ACTIVITY_TYPES.ACTIVITY | typeof ACTIVITY_TYPES.COMMENT;
      timestamp: UnixTimestampSeconds;
      author: {
        firstName: string;
        lastName: string;
        _id: string;
      };
      text: string;
      label: string;
    }
  | {
      type: typeof ACTIVITY_TYPES.CANCELLATION;
      timestamp: UnixTimestampSeconds;
      author: {
        firstName: string;
        lastName: string;
        _id: string;
      };
      bankRequestDate: UnixTimestamp;
      effectiveFrom: UnixTimestamp;
      reason: string;
    };
