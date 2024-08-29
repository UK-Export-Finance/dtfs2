import {
  IsoDateTimeStamp,
  ReportPeriod,
  UtilisationReportReconciliationStatus,
  FeeRecordStatus,
  CurrencyAndAmount,
  KeyingSheetRowStatus,
  Currency,
  KeyingSheetAdjustment,
} from '@ukef/dtfs2-common';
import { FeeRecord } from './fee-record';
import { Payment } from './payment';

type FeeRecordPaymentGroup = {
  feeRecords: FeeRecord[];
  totalReportedPayments: CurrencyAndAmount;
  paymentsReceived: Payment[] | null;
  totalPaymentsReceived: CurrencyAndAmount | null;
  status: FeeRecordStatus;
  reconciledByUser?: {
    firstName: string;
    lastName: string;
  };
  dateReconciled?: IsoDateTimeStamp;
};

type KeyingSheet = {
  feeRecordId: number;
  status: KeyingSheetRowStatus;
  facilityId: string;
  exporter: string;
  datePaymentReceived: IsoDateTimeStamp;
  feePayments: {
    currency: Currency;
    amount: number;
    dateReceived: IsoDateTimeStamp | null;
  }[];
  baseCurrency: Currency;
  fixedFeeAdjustment: KeyingSheetAdjustment | null;
  principalBalanceAdjustment: KeyingSheetAdjustment | null;
}[];

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
  keyingSheet: KeyingSheet;
};
