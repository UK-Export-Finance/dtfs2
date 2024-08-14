import { FeeRecordEntity, PaymentEntity } from '@ukef/dtfs2-common';
import { InvalidPayloadError } from '../../../errors';

const getPaymentEntityFeeRecordIds = (payment: PaymentEntity) => {
  return payment.feeRecords.map((record) => record.id);
};

export const validateThatSelectedPaymentsBelongToSamePaymentGroup = (payments: PaymentEntity[]) => {
  const [firstPayment, ...otherPayments] = payments;
  const firstPaymentFeeRecordIds = getPaymentEntityFeeRecordIds(firstPayment);

  otherPayments.forEach((payment) => {
    const currentPaymentFeeRecordIds = getPaymentEntityFeeRecordIds(payment);
    if (
      firstPaymentFeeRecordIds.length !== currentPaymentFeeRecordIds.length ||
      !firstPaymentFeeRecordIds.every((id) => currentPaymentFeeRecordIds.includes(id))
    ) {
      throw new InvalidPayloadError('Selected payments do not all belong to same payment group.');
    }
  });
};

export const validateThatSelectedPaymentsFormACompletePaymentGroup = (payments: PaymentEntity[], paymentIds: number[]) => {
  if (payments.length === 0 || payments.at(0)?.feeRecords.length === 0) {
    return;
  }

  const firstPayment = payments.at(0);
  const firstPaymentsFirstFeeRecord = firstPayment?.feeRecords.at(0);
  const firstPaymentsFirstFeeRecordPaymentIds = firstPaymentsFirstFeeRecord?.payments.map((payment) => payment.id);

  if (!firstPaymentsFirstFeeRecordPaymentIds || firstPaymentsFirstFeeRecordPaymentIds.length !== paymentIds.length) {
    throw new InvalidPayloadError('Selected payment count does not match the payment group size.');
  }

  if (firstPaymentsFirstFeeRecordPaymentIds.some((id) => !paymentIds.includes(id))) {
    throw new InvalidPayloadError('Selected payments do not match the expected payment group payments.');
  }
};

export function validateThatPaymentGroupHasFeeRecords(
  paymentGroupFeeRecords: FeeRecordEntity[] | undefined,
): asserts paymentGroupFeeRecords is FeeRecordEntity[] {
  if (!paymentGroupFeeRecords || paymentGroupFeeRecords.length === 0) {
    throw new InvalidPayloadError('The payment group has no fee records.');
  }
}
