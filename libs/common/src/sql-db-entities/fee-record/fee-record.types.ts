import { DbRequestSource, DbRequestSourceParam } from '../helpers';
import { Currency, FeeRecordStatus, RecordCorrectionValues } from '../../types';
import { UtilisationReportEntity } from '../utilisation-report';

export type CreateFeeRecordParams = DbRequestSourceParam & {
  facilityId: string;
  exporter: string;
  baseCurrency: Currency;
  facilityUtilisation: number;
  totalFeesAccruedForThePeriod: number;
  totalFeesAccruedForThePeriodCurrency: Currency;
  totalFeesAccruedForThePeriodExchangeRate: number;
  feesPaidToUkefForThePeriod: number;
  feesPaidToUkefForThePeriodCurrency: Currency;
  paymentCurrency: Currency;
  paymentExchangeRate: number;
  status: FeeRecordStatus;
  report: UtilisationReportEntity;
};

export type UpdateWithStatusParams = {
  status: FeeRecordStatus;
  requestSource: DbRequestSource;
};

export type UpdateWithCorrectionParams = {
  requestSource: DbRequestSource;
  correctedValues: RecordCorrectionValues;
};

export type UpdateWithKeyingDataParams = {
  status: Extract<FeeRecordStatus, 'READY_TO_KEY' | 'RECONCILED'>;
  fixedFeeAdjustment: number;
  principalBalanceAdjustment: number;
  requestSource: DbRequestSource;
};

export type RemoveAllPaymentsParams = {
  status: FeeRecordStatus;
  requestSource: DbRequestSource;
};

export type MarkAsReconciledParams = {
  reconciledByUserId: string;
  requestSource: DbRequestSource;
};

export type MarkAsReadyToKeyParams = {
  requestSource: DbRequestSource;
};
