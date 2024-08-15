import { FeeRecordEntity, PaymentEntity } from '@ukef/dtfs2-common';
import { InvalidPayloadError } from '../../../errors';

export const validateThatRequestedPaymentsMatchSavedPayments = (savedPayments: PaymentEntity[], requestedPaymentIds: number[]) => {
  const savedPaymentIds = savedPayments.map((payment) => payment.id);

  if (!savedPaymentIds.every((id) => requestedPaymentIds.includes(id)) || !requestedPaymentIds.every((id) => savedPaymentIds.includes(id))) {
    throw new InvalidPayloadError('Requested payment IDs do not match saved payment IDs');
  }
};

export function validateThatPaymentGroupHasFeeRecords(
  paymentGroupFeeRecords: FeeRecordEntity[] | undefined,
): asserts paymentGroupFeeRecords is FeeRecordEntity[] {
  if (!paymentGroupFeeRecords || paymentGroupFeeRecords.length === 0) {
    throw new InvalidPayloadError('The payment group has no fee records.');
  }
}
