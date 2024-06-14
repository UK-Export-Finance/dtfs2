import { IsoDateTimeStamp, ReportPeriod, UtilisationReportReconciliationStatus, FeeRecordStatus, CurrencyAndAmount } from '@ukef/dtfs2-common';

type FeeRecordItem = {
  id: number;
  facilityId: string;
  exporter: string;
  reportedFees: CurrencyAndAmount;
  reportedPayments: CurrencyAndAmount;
};

type FeeRecordPaymentGroup = {
  feeRecords: FeeRecordItem[];
  totalReportedPayments: CurrencyAndAmount;
  paymentsReceived: CurrencyAndAmount[] | null;
  totalPaymentsReceived: CurrencyAndAmount | null;
  status: FeeRecordStatus;
};

export type UtilisationReportReconciliationDetailsResponseBody = {
  reportId: number;
  bank: {
    id: string;
    name: string;
  };
  status: UtilisationReportReconciliationStatus;
  reportPeriod: ReportPeriod;
  dateUploaded: IsoDateTimeStamp;
  feeRecordPaymentGroups: FeeRecordPaymentGroup[];
};
