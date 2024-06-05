import { FeeRecordEntity } from '@ukef/dtfs2-common';
import { InvalidPayloadError } from '../../../errors';

export const validateSelectedFeeRecordsAllHaveSamePaymentCurrency = (selectedFeeRecords: FeeRecordEntity[]) => {
  if (selectedFeeRecords.length <= 1) {
    return;
  }
  const { paymentCurrency } = selectedFeeRecords[0];
  if (selectedFeeRecords.some((feeRecord) => feeRecord.paymentCurrency !== paymentCurrency)) {
    throw new InvalidPayloadError('Selected fee records must all have the same payment currency');
  }
};
