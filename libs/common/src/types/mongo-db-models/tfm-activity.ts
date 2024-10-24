import { ACTIVITY_TYPES } from '../../constants';
import { UnixTimestamp, UnixTimestampSeconds } from '../date';

const { ACTIVITY, COMMENT, CANCELLATION } = ACTIVITY_TYPES;

export type TfmActivity =
  | {
      type: typeof ACTIVITY | typeof COMMENT;
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
      type: typeof CANCELLATION;
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
