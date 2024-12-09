import {
  Currency,
  ReportPeriod,
  AzureFileInfo,
  UploadedByUserDetails,
  IsoMonthStamp,
  FeeRecordStatus,
  CurrencyAndAmount,
  FeeRecordUtilisation,
  UtilisationReportStatus,
} from '@ukef/dtfs2-common';
import { FeeRecord, KeyingSheet } from './fee-records';
import { Payment } from './payments';

export type GetUtilisationReportResponse = {
  id: number;
  bankId: string;
  status: UtilisationReportStatus;
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
  status: UtilisationReportStatus;
  dateUploaded?: Date;
  totalFacilitiesReported?: number;
  totalFeesReported?: number;
  reportedFeesLeftToReconcile?: number;
};

export type UtilisationReportReconciliationSummary = {
  submissionMonth: IsoMonthStamp;
  items: UtilisationReportReconciliationSummaryItem[];
};

export type FeeRecordReconciledByUser = {
  firstName: string;
  lastName: string;
};

export type PremiumPaymentsGroup = {
  feeRecords: FeeRecord[];
  totalReportedPayments: CurrencyAndAmount;
  paymentsReceived: Payment[] | null;
  totalPaymentsReceived: CurrencyAndAmount | null;
  status: FeeRecordStatus;
};

export type PaymentDetails = {
  feeRecords: FeeRecord[];
  payment: Payment;
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
  status: UtilisationReportStatus;
  reportPeriod: ReportPeriod;
  dateUploaded: Date;
  premiumPayments: PremiumPaymentsGroup[];
  paymentDetails: PaymentDetails[];
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

export type ReportReconciledEmailVariables = {
  bankRecipient: string;
  reportReconciledDate: string;
  reportPeriod: string;
};

export type ReportReconciledEmail = {
  emails: Array<string>;
  variables: ReportReconciledEmailVariables;
};

type FeeRecordCorrectionRequestEmailVariables = {
  recipient: string;
  reportPeriod: string;
  exporterName: string;
  reasonsList: string;
};

export type FeeRecordCorrectionRequestEmails = {
  emails: Array<string>;
  variables: FeeRecordCorrectionRequestEmailVariables;
};
