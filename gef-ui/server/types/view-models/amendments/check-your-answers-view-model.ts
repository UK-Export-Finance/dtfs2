import { FacilityType, SummaryListRow } from '@ukef/dtfs2-common';

export type CheckYourAnswersViewModel = {
  exporterName: string;
  facilityType: FacilityType;
  previousPage: string;
  cancelUrl: string;
  amendmentRows: SummaryListRow[];
  eligibilityRows: SummaryListRow[];
  effectiveDateRows: SummaryListRow[];
};
