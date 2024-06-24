import {
  ValuesOf,
  UtilisationReportReconciliationStatus,
  Currency,
  ReportPeriod,
  AzureFileInfo,
  UploadedByUserDetails,
  UTILISATION_REPORT_HEADERS,
  IsoMonthStamp,
  FeeRecordStatus,
  CurrencyAndAmount,
  SessionBank,
} from '@ukef/dtfs2-common';
import { FeeRecord, FeeRecordToKey } from './fee-records';
import { Payment } from './payments';

export type GetUtilisationReportResponse = {
  id: number;
  bankId: string;
  status: UtilisationReportReconciliationStatus;
  reportPeriod: ReportPeriod;
} & (
  | {
      uploadedByUser: UploadedByUserDetails;
      azureFileInfo: AzureFileInfo;
      dateUploaded: Date;
    }
  | {
      uploadedByUser: null;
      azureFileInfo: null;
      dateUploaded: null;
    }
);

export type UtilisationReportReconciliationSummaryItem = {
  reportId: number;
  reportPeriod: ReportPeriod;
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

type UtilisationReportHeader = ValuesOf<typeof UTILISATION_REPORT_HEADERS>;

export type UtilisationReportRawCsvData = {
  [HeaderKey in UtilisationReportHeader]: HeaderKey extends `${string}currency` ? Currency : string;
};

export type FeeRecordPaymentGroup = {
  feeRecords: FeeRecord[];
  totalReportedPayments: CurrencyAndAmount;
  paymentsReceived: Payment[] | null;
  totalPaymentsReceived: CurrencyAndAmount | null;
  status: FeeRecordStatus;
};

export type UtilisationReportReconciliationDetails = {
  reportId: number;
  bank: {
    id: string;
    name: string;
  };
  status: UtilisationReportReconciliationStatus;
  reportPeriod: ReportPeriod;
  dateUploaded: Date;
  feeRecordPaymentGroups: FeeRecordPaymentGroup[];
};

export type NewPaymentDetails = {
  currency: Currency;
  amount: number;
  dateReceived: Date;
  reference?: string;
};

export type UtilisationReportWithFeeRecordsToKey = {
  id: number;
  bank: SessionBank;
  reportPeriod: ReportPeriod;
  feeRecords: FeeRecordToKey[];
};
