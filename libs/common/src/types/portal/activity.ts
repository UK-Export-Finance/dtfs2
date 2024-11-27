import { ValuesOf } from '..';
import { PORTAL_ACTIVITY_LABEL, PORTAL_ACTIVITY_TYPE } from '../../constants';

// TODO: ActivityApplicationType?
export type ApplicationType = ValuesOf<typeof PORTAL_ACTIVITY_TYPE>;
export type ActivityType = ValuesOf<typeof PORTAL_ACTIVITY_LABEL>;

export type Activity = {
  type: ApplicationType;
  activityType: ActivityType;
  timestamp: number;
  user: any; // TODO
  activityText: string;
  activityHTML: string;
  maker: string; // TODO: is this correct or an object? Seen an instance of empty strings for this.
  checker: string; // TODO: is this correct or an object? Seen an instance of empty strings for this.
};

// activityType: PORTAL_ACTIVITY_TYPE.NOTICE,
// activityText: '',
// activityHTML: '',
// facility: '',
// maker: '',
// checker: '',
