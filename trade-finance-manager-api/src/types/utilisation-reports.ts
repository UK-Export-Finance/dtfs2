import { ValuesOf } from './types-helper';
import { UTILISATION_REPORT_RECONCILIATION_STATUS } from '../constants';
import { IsoDateTimeStamp, MonthAndYear } from './date';

export type UtilisationReportReconciliationStatus = ValuesOf<typeof UTILISATION_REPORT_RECONCILIATION_STATUS>;

export type AzureFileInfo = {
  folder: string;
  filename: string;
  fullPath: string;
  url: string;
  mimetype: string;
};

export type ReportPeriod = {
  start: MonthAndYear;
  end: MonthAndYear;
};

export type UtilisationReportResponseBody = {
  id: number;
  bankId: string;
  reportPeriod: ReportPeriod;
  dateUploaded: IsoDateTimeStamp;
  azureFileInfo: AzureFileInfo | null;
  status: UtilisationReportReconciliationStatus;
  uploadedByUserId: string | null
};

export type ReportWithStatus = {
  status: UtilisationReportReconciliationStatus;
  reportId: string;
};
