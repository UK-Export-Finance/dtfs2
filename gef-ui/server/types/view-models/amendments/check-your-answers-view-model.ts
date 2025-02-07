import { FacilityType, PortalFacilityAmendmentWithUkefId, SummaryListRow } from '@ukef/dtfs2-common';

export type CheckYourAnswersViewModel = {
  exporterName: string;
  facilityType: FacilityType;
  previousPage: string;
  cancelUrl: string;
  amendmentSummaryListParams: {
    amendmentRows: SummaryListRow[];
    eligibilityRows: SummaryListRow[];
    effectiveDateRows: SummaryListRow[];
  };
  amendment: PortalFacilityAmendmentWithUkefId;
};
