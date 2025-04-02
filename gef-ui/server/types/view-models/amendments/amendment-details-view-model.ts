import { SummaryListRow } from '@ukef/dtfs2-common';

export type AmendmentDetailsViewModel = {
  userRoles: string[];
  exporterName: string;
  facilityType: string;
  previousPage: string;
  amendmentSummaryListParams: {
    amendmentRows: SummaryListRow[];
    eligibilityRows: SummaryListRow[];
    effectiveDateRows: SummaryListRow[];
  };
};
