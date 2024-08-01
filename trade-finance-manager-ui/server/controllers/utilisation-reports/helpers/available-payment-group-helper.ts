import { SelectedFeeRecordsAvailablePaymentDetails } from '@ukef/dtfs2-common';
import { AddToAnExistingPaymentRadioId } from '../../../types/add-to-an-existing-payment-radio-id';

export const getRadioIdForPaymentGroup = (payments: SelectedFeeRecordsAvailablePaymentDetails[]): AddToAnExistingPaymentRadioId => {
  const paymentIdList = payments.map(({ id }) => id).join(',');
  return `paymentIds-${paymentIdList}`;
};
