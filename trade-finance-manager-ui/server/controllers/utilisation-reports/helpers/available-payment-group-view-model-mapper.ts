import { getFormattedCurrencyAndAmount, SelectedFeeRecordsAvailablePaymentDetails, SelectedFeeRecordsAvailablePaymentGroups } from '@ukef/dtfs2-common';
import { AvailablePaymentGroupsViewModel, AvailablePaymentViewModelItem } from '../../../types/view-models';
import { AddToAnExistingPaymentRadioId } from '../../../types/add-to-an-existing-payment-radio-id';

const getRadioIdForPaymentGroup = (payments: SelectedFeeRecordsAvailablePaymentDetails[]): AddToAnExistingPaymentRadioId => {
  const paymentIdList = payments.map(({ id }) => id).join(',');
  return `paymentIds-${paymentIdList}`;
};

const mapToAvailablePaymentViewModelItem = (payment: SelectedFeeRecordsAvailablePaymentDetails): AvailablePaymentViewModelItem => ({
  id: payment.id.toString(),
  formattedCurrencyAndAmount: getFormattedCurrencyAndAmount({ currency: payment.currency, amount: payment.amount }),
  reference: payment.reference,
});

export const mapToAvailablePaymentGroupsViewModel = (availablePaymentGroupsData: SelectedFeeRecordsAvailablePaymentGroups): AvailablePaymentGroupsViewModel => {
  return availablePaymentGroupsData.map((paymentGroup) => ({
    radioId: getRadioIdForPaymentGroup(paymentGroup),
    payments: paymentGroup.map((payment) => mapToAvailablePaymentViewModelItem(payment)),
  }));
};
