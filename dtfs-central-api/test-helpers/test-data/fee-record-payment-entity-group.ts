import { FeeRecordStatus, Currency, FeeRecordEntityMockBuilder, UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common';
import { FeeRecordPaymentEntityGroup } from '../../src/types/fee-record-payment-entity-group';

export const createFeeRecordEntityPaymentGroupForSingleFeeRecord = (
  id: number,
  status: FeeRecordStatus,
  currency: Currency,
  feesPaidToUkefForThePeriod: number,
): FeeRecordPaymentEntityGroup => {
  const report = UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS').build();

  return {
    feeRecords: [
      FeeRecordEntityMockBuilder.forReport(report)
        .withId(id)
        .withStatus(status)
        .withFeesPaidToUkefForThePeriod(feesPaidToUkefForThePeriod)
        .withFeesPaidToUkefForThePeriodCurrency(currency)
        .withPaymentCurrency(currency)
        .build(),
    ],
    payments: [],
  };
};
