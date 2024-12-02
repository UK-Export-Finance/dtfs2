import { ActivityAuthor, ValuesOf } from '..';
import { PORTAL_ACTIVITY_LABEL, PORTAL_ACTIVITY_TYPE } from '../../constants';

export type ActivityType = ValuesOf<typeof PORTAL_ACTIVITY_TYPE>;
export type ActivityLabel = ValuesOf<typeof PORTAL_ACTIVITY_LABEL>;

/**
 * NOTE: type and activityType are confusing.
 * - type/ActivityType e.g "DEAL_CANCELLED"
 * - activityType/ActivityLabel e.g "Deal cancelled"
 * Because we have two fields using a "type" naming convention:
 * - The "type" field is clear.
 * - The "activityType" field uses an "ActivityLabel" type to help clarify.
 * Ideally, we would run some data migration to rename one or both of these fields.
 */
export type Activity = {
  type: ActivityType;
  activityType?: ActivityLabel;
  author: ActivityAuthor;
  timestamp: number;
  label: string;
  facilityType?: string;
  ukefFacilityId?: string;
  facilityId?: string;
  activityText?: string;
  activityHTML?: string;
  maker?: string;
  checker?: string;
};
