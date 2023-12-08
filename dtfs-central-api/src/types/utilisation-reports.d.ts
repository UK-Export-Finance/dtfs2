import { ObjectId } from 'mongodb';

export type UtilisationReportReconciliationStatus =
  | 'REPORT_NOT_RECEIVED'
  | 'PENDING_RECONCILIATION'
  | 'RECONCILIATION_IN_PROGRESS'
  | 'RECONCILIATION_COMPLETED';

export type UtilisationReportReconciliationSummaryItem = {
  reportId?: ObjectId;
  bank: {
    id: string;
    name: string;
  };
  status: UtilisationReportReconciliationStatus;
  dateUploaded?: Date;
  totalFacilitiesReported?: number;
  facilitiesLeftToReconcile?: number;
};
