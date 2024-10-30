import { FEE_RECORD_STATUS, FeeRecordEntity } from '@ukef/dtfs2-common';
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

/**
 * Validates that all selected fee records with payments have the same fee
 * record payment group and that the fee record IDs match the fee record IDs on
 * this existing payment group.
 * @param selectedFeeRecords - The selected fee records
 * @param requestedFeeRecordIds - The requested fee record IDs
 */
export const validateThatAllSelectedFeeRecordsWithPaymentsFormACompletePaymentGroup = (
  selectedFeeRecords: FeeRecordEntity[],
  requestedFeeRecordIds: number[],
) => {
  const firstFeeRecord = selectedFeeRecords[0];

  if (firstFeeRecord.status === FEE_RECORD_STATUS.DOES_NOT_MATCH) {
    const firstPayment = firstFeeRecord.payments[0];
    const savedFeeRecordIds = firstPayment.feeRecords.map((feeRecord) => feeRecord.id);

    if (!savedFeeRecordIds.every((id) => requestedFeeRecordIds.includes(id)) || !requestedFeeRecordIds.every((id) => savedFeeRecordIds.includes(id))) {
      throw new InvalidPayloadError('Requested fee record IDs do not match the fee record IDs on the existing payment group.');
    }
  }
};
