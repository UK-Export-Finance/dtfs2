import { ValuesOf } from '..';
// import { PORTAL_ACTIVITY_LABEL, PORTAL_ACTIVITY_TYPE } from '../../constants';

// TODO: move this to libs/common
export const PORTAL_ACTIVITY_LABEL = {
  MIA_SUBMISSION: 'Manual inclusion application submitted to UKEF',
  MIN_SUBMISSION: 'Manual inclusion notice submitted to UKEF',
  AIN_SUBMISSION: 'Automatic inclusion notice submitted to UKEF',
  FACILITY_CHANGED_ISSUED: 'Bank facility stage changed',
  DEAL_CANCELLED: 'Deal cancelled',
} as const;

// TODO: move this to libs/common
export const PORTAL_ACTIVITY_TYPE = {
  NOTICE: 'NOTICE',
  FACILITY_STAGE: 'FACILITY_STAGE',
} as const;

// TODO: ActivityApplicationType?
export type ApplicationType = ValuesOf<typeof PORTAL_ACTIVITY_TYPE>;
export type ActivityType = ValuesOf<typeof PORTAL_ACTIVITY_LABEL>;

export type Activity = {
  type: ApplicationType;
  activityType: ActivityType;
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
