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
} from '@ukef/dtfs2-common';
import { FeeRecord, FeeRecordUtilisation, KeyingSheet } from './fee-records';
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
  totalFacilitiesReported?: number;
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

export type FeeRecordReconciledByUser = {
  firstName: string;
  lastName: string;
};

export type FeeRecordPaymentGroup = {
  feeRecords: FeeRecord[];
  totalReportedPayments: CurrencyAndAmount;
  paymentsReceived: Payment[] | null;
  totalPaymentsReceived: CurrencyAndAmount | null;
  status: FeeRecordStatus;
  reconciledByUser?: FeeRecordReconciledByUser;
  dateReconciled?: Date;
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
  premiumPayments: FeeRecordPaymentGroup[];
  paymentDetails: FeeRecordPaymentGroup[];
  keyingSheet: KeyingSheet;
  utilisationDetails: FeeRecordUtilisation[];
};

export type NewPaymentDetails = {
  currency: Currency;
  amount: number;
  dateReceived: Date;
  reference?: string;
};

export type ValidatedPaymentDetailsFilters = {
  facilityId?: string;
  paymentCurrency?: Currency;
  paymentReference?: string;
};
