import { FacilityType } from '@ukef/dtfs2-common';

export type AbandonAmendmentViewModel = {
  exporterName: string;
  facilityType: FacilityType;
  previousPage: string;
  applicationDetailsUrl: string;
};
