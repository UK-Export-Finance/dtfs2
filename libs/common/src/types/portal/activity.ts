import { ActivityAuthor, ValuesOf } from '..';
import { PORTAL_ACTIVITY_LABEL, PORTAL_ACTIVITY_TYPE } from '../../constants';

export type ActivityType = ValuesOf<typeof PORTAL_ACTIVITY_TYPE>;
export type ActivityLabel = ValuesOf<typeof PORTAL_ACTIVITY_LABEL>;

export type Activity = {
  type: ActivityType;
  timestamp: number;
  author: ActivityAuthor;
  label: string;
  activityType?: ActivityLabel;
  facilityType?: string;
  ukefFacilityId?: string;
  facilityId?: string;
  activityText?: string;
  activityHTML?: string;
  maker?: string;
  checker?: string;
};
