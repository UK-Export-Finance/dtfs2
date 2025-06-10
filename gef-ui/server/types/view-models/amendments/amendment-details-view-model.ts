import { SummaryListRow } from '@ukef/dtfs2-common';

export type AmendmentDetailsViewModel = {
  userRoles: string[];
  exporterName: string;
  facilityType: string;
  submitAmendment: boolean;
  dealId: string;
  facilityId: string;
  amendmentId: string;
  amendmentStatus: string;
  previousPage: string;
  effectiveDate: string;
  banner?: boolean;
  amendmentSummaryListParams: {
    amendmentRows: SummaryListRow[];
    eligibilityRows: SummaryListRow[];
    effectiveDateRows: SummaryListRow[];
  };
};
