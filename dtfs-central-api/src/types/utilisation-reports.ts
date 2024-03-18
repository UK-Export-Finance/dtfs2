import {
  ValuesOf,
  UtilisationReportReconciliationStatus,
  UtilisationReport,
  Prettify,
  UTILISATION_REPORT_RECONCILIATION_STATUS,
  Currency,
  ReportPeriod,
  AzureFileInfo,
} from '@ukef/dtfs2-common';
import { IsoMonthStamp } from './date';
import { UTILISATION_REPORT_HEADERS } from '../constants';

export type GetUtilisationReportResponse = {
  id: number;
  bankId: string;
  status: UtilisationReportReconciliationStatus;
  uploadedByUserId: string | null;
  reportPeriod: ReportPeriod;
  azureFileInfo: AzureFileInfo | null;
  dateUploaded: Date | null;
};

export type UtilisationReportReconciliationSummaryItem = {
  reportId: number;
  bank: {
    id: string;
    name: string;
  };
  status: UtilisationReportReconciliationStatus;
  dateUploaded?: Date;
  totalFeesReported?: number;
  reportedFeesLeftToReconcile?: number;
};

export type UtilisationReportReconciliationSummary = {
  submissionMonth: IsoMonthStamp;
  items: UtilisationReportReconciliationSummaryItem[];
};

export type ReportWithStatus = {
  status: UtilisationReportReconciliationStatus;
  reportId: string;
};

type UtilisationReportHeader = ValuesOf<typeof UTILISATION_REPORT_HEADERS>;

export type UtilisationReportRawCsvData = {
  [HeaderKey in UtilisationReportHeader]: HeaderKey extends `${string}currency` ? Currency : string;
};

export type UtilisationReportUploadDetails = Prettify<
  Required<
    Pick<UtilisationReport, 'azureFileInfo' | 'dateUploaded' | 'uploadedBy'> & {
      status: typeof UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION;
    }
  >
>;
