import { SelectedFeeRecordsAvailablePaymentGroups } from '@ukef/dtfs2-common';

export const getAvailablePaymentsHeading = (paymentGroups: SelectedFeeRecordsAvailablePaymentGroups) => {
  if (!paymentGroups || paymentGroups.length === 0) {
    throw new Error('No payment groups to select from.');
  }

  const numOfSinglePayments = paymentGroups.filter((group) => group.length === 1).length;
  const numOfGroupPayments = paymentGroups.filter((group) => group.length > 1).length;

  if (paymentGroups.length === 1) {
    if (numOfSinglePayments === 1) {
      return 'There is one existing payment that the reported fees will be added to';
    }

    return 'There is one existing group of payments that the reported fees will be added to';
  }

  if (numOfSinglePayments > 1 && numOfGroupPayments === 0) {
    return 'Which payment do you want to add the reported fees to?';
  }

  if (numOfSinglePayments === 0 && numOfGroupPayments > 1) {
    return 'Which group of payments do you want to add the reported fees to?';
  }

  return 'Which payment or group of payments do you want to add the reported fees to?';
};
