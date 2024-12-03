import { ActivityAuthor, ValuesOf } from '..';
import { PORTAL_ACTIVITY_LABEL, PORTAL_ACTIVITY_TYPE } from '../../constants';

export type PortalActivityType = ValuesOf<typeof PORTAL_ACTIVITY_TYPE>;
export type PortalActivityLabel = ValuesOf<typeof PORTAL_ACTIVITY_LABEL>;

/**
 * NOTE: type and activityType are confusing.
 * - type/PortalActivityType e.g "DEAL_CANCELLED"
 * - activityType/PortalActivityLabel e.g "Deal cancelled"
 * Because we have two fields using a "type" naming convention:
 * - The "type" field is clear.
 * - The "activityType" field uses an "PortalActivityLabel" type to help clarify.
 * Ideally, we would run some data migration to rename one or both of these fields.
 */
export type PortalActivity = {
  type: PortalActivityType;
  activityType?: PortalActivityLabel;
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
