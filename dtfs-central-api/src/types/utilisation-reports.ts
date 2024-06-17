import {
  ValuesOf,
  UtilisationReportReconciliationStatus,
  UtilisationReport,
  Prettify,
  UTILISATION_REPORT_RECONCILIATION_STATUS,
  Currency,
  ReportPeriod,
  AzureFileInfo,
  UploadedByUserDetails,
  UTILISATION_REPORT_HEADERS,
  IsoMonthStamp,
  FeeRecordStatus,
  CurrencyAndAmount,
} from '@ukef/dtfs2-common';

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

export type UtilisationReportUploadDetails = Prettify<
  Required<
    Pick<UtilisationReport, 'azureFileInfo' | 'dateUploaded' | 'uploadedBy'> & {
      status: typeof UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION;
    }
  >
>;

export type FeeRecordItem = {
  /**
   * The fee record id
   */
  id: number;
  /**
   * The facility id
   */
  facilityId: string;
  /**
   * The exporter
   */
  exporter: string;
  /**
   * The fees paid to UKEF for the period in the actual payment currency
   */
  reportedFees: CurrencyAndAmount;
  /**
   * The fees paid to UKEF converted to the payment currency
   */
  reportedPayments: CurrencyAndAmount;
};

export type Payment = CurrencyAndAmount & {
  id: number;
};

export type FeeRecordPaymentGroup = {
  feeRecords: FeeRecordItem[];
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
