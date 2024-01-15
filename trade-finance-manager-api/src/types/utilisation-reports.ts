import { ValuesOf } from './types-helper';
import { UTILISATION_REPORT_RECONCILIATION_STATUS } from '../constants';
import { IsoDateTimeStamp } from './date';

export type UtilisationReportReconciliationStatus = ValuesOf<typeof UTILISATION_REPORT_RECONCILIATION_STATUS>;

export type AzureFileInfo = {
  folder: string;
  filename: string;
  fullPath: string;
  url: string;
  mimetype: string;
};

type MonthAndYear = {
  month: number;
  year: number;
};

export type ReportPeriod = {
  start: MonthAndYear;
  end: MonthAndYear;
};

export type UtilisationReportResponseBody = {
  _id: string;
  bank: {
    id: string;
    name: string;
  };
  reportPeriod: ReportPeriod;
  dateUploaded: IsoDateTimeStamp;
  azureFileInfo: AzureFileInfo | null;
  status: UtilisationReportReconciliationStatus;
  uploadedBy: {
    id: string;
    firstname: string;
    surname: string;
  };
};

type ReportId = {
  id: string;
};

type ReportDetails = {
  month: number;
  year: number;
  bankId: string;
};

export type ReportIdentifier = ReportId | ReportDetails;

export type ReportWithStatus = {
  status: UtilisationReportReconciliationStatus;
  report: ReportIdentifier;
};
