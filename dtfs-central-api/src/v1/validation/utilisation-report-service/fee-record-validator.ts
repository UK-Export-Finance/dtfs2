import { FEE_RECORD_STATUS, FeeRecordEntity, FeeRecordStatus } from '@ukef/dtfs2-common';
import { FeeRecordRepo } from '../../../repositories/fee-record-repo';
import { InvalidPayloadError } from '../../../errors';

/**
 * Validates that all provided fee records have the same payment currency.
 * If there is only one fee record or less, validation passes.
 * @param feeRecords - The fee records to validate
 * @throws {InvalidPayloadError} If fee records have different payment currencies
 */
export const validateFeeRecordsAllHaveSamePaymentCurrency = (feeRecords: FeeRecordEntity[]) => {
  if (feeRecords.length <= 1) {
    return;
  }

  const { paymentCurrency } = feeRecords[0];

  if (feeRecords.some((feeRecord) => feeRecord.paymentCurrency !== paymentCurrency)) {
    throw new InvalidPayloadError('Fee records must all have the same payment currency');
  }
};

/**
 * Validates that all provided fee records with payments have the same fee
 * record payment group and that the fee record IDs match the fee record IDs on
 * this existing payment group.
 * @param ids - The fee record IDs
 * @throws {InvalidPayloadError} If fee records have different statuses
 * @throws {InvalidPayloadError} If fee record IDs do not match the fee record IDs on the existing payment group
 */
export const validateFeeRecordsFormCompleteGroup = async (ids: number[]) => {
  const feeRecords = await FeeRecordRepo.findByIdWithPaymentsAndFeeRecords(ids);

  const feeRecordStatuses = feeRecords.reduce((statuses, { status }) => statuses.add(status), new Set<FeeRecordStatus>());
  if (feeRecordStatuses.size !== 1) {
    throw new InvalidPayloadError('Fee records must all have the same status');
  }

  const firstFeeRecord = feeRecords[0];

  // Fee records with TO_DO status do not have any payments attached, so do not have an existing payment group
  if (firstFeeRecord.status === FEE_RECORD_STATUS.TO_DO) {
    return;
  }

  const firstPayment = firstFeeRecord.payments[0];

  const savedIds = firstPayment.feeRecords.map((feeRecord) => feeRecord.id);

  const allSavedIdsAreProvided = savedIds.every((id) => ids.includes(id));
  const allProvidedIdsAreSaved = ids.every((id) => savedIds.includes(id));

  if (!allSavedIdsAreProvided || !allProvidedIdsAreSaved) {
    throw new InvalidPayloadError('Requested fee record IDs do not match the fee record IDs on the existing payment group.');
  }
};
