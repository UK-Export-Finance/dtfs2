import { FacilityType } from '@ukef/dtfs2-common';

export type ManualApprovalNeededViewModel = {
  exporterName: string;
  facilityType: FacilityType;
  previousPage: string;
  amendmentFormEmail: string;
  returnLink: string;
};
