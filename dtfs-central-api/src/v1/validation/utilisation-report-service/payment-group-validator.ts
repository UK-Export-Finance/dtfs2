import { PaymentEntity } from '@ukef/dtfs2-common';
import { InvalidPayloadError } from '../../../errors';

const getPaymentEntityFeeRecordIds = (payment: PaymentEntity) => {
  return payment.feeRecords.map((record) => record.id);
};

export const validatePaymentGroupPaymentsAllHaveSameFeeRecords = (payments: PaymentEntity[]) => {
  const [firstPayment, ...otherPayments] = payments;
  const firstPaymentFeeRecordIds = getPaymentEntityFeeRecordIds(firstPayment);

  otherPayments.forEach((payment) => {
    const currentPaymentFeeRecordIds = getPaymentEntityFeeRecordIds(payment);
    if (
      firstPaymentFeeRecordIds.length !== currentPaymentFeeRecordIds.length ||
      !firstPaymentFeeRecordIds.every((id) => currentPaymentFeeRecordIds.includes(id))
    ) {
      throw new InvalidPayloadError('Payment group payments must all have the same set of fee records attached.');
    }
  });
};

export const validateProvidedPaymentIdsMatchFirstPaymentsFirstFeeRecordPaymentIds = (payments: PaymentEntity[], paymentIds: number[]) => {
  if (payments.length === 0 || payments.at(0)?.feeRecords.length === 0) {
    return;
  }

  const firstPayment = payments.at(0);
  const firstPaymentsFirstFeeRecord = firstPayment?.feeRecords.at(0);
  const firstPaymentsFirstFeeRecordPaymentIds = firstPaymentsFirstFeeRecord?.payments.map((payment) => payment.id);

  if (!firstPaymentsFirstFeeRecordPaymentIds || firstPaymentsFirstFeeRecordPaymentIds.length !== paymentIds.length) {
    throw new InvalidPayloadError('Payment group payment count must equal the number of payments attached to the first fee record of the first payment.');
  }

  if (firstPaymentsFirstFeeRecordPaymentIds.some((id) => !paymentIds.includes(id))) {
    throw new InvalidPayloadError('Payment group payment IDs do not match the IDs of the payments attached to the first fee record of the first payment.');
  }
};
