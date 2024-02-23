import { UtilisationReportReconciliationStatus } from "@ukef/dtfs2-common";

export type ReportWithStatus = {
  status: UtilisationReportReconciliationStatus;
  reportId: string;
};
