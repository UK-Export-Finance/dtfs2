import { IsoDateTimeStamp, ReportPeriod, UtilisationReportReconciliationStatus, FeeRecordStatus, CurrencyAndAmount } from '@ukef/dtfs2-common';
import { FeeRecord } from './fee-record';

type Payment = CurrencyAndAmount & {
  id: number;
};

type FeeRecordPaymentGroup = {
  feeRecords: FeeRecord[];
  totalReportedPayments: CurrencyAndAmount;
  paymentsReceived: Payment[] | null;
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
