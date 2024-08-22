import { SelectedFeeRecordsAvailablePaymentGroups } from '@ukef/dtfs2-common';

/**
 * Gets the available payments heading for the selected fee records available
 * payment groups
 * @param paymentGroups - The  selected fee records available payment groups
 * @returns The available payments heading string
 */
export const getAvailablePaymentsHeading = (paymentGroups: SelectedFeeRecordsAvailablePaymentGroups) => {
  const totalNumberOfPaymentGroups = paymentGroups.length;
  const numberOfSinglePayments = paymentGroups.filter((group) => group.length === 1).length;
  const numberOfGroupPayments = totalNumberOfPaymentGroups - numberOfSinglePayments;

  if (totalNumberOfPaymentGroups === 1) {
    if (numberOfSinglePayments === 1) {
      return 'There is one existing payment that the reported fees will be added to';
    }

    return 'There is one existing group of payments that the reported fees will be added to';
  }

  if (numberOfSinglePayments === totalNumberOfPaymentGroups) {
    return 'Which payment do you want to add the reported fees to?';
  }

  if (numberOfGroupPayments === totalNumberOfPaymentGroups) {
    return 'Which group of payments do you want to add the reported fees to?';
  }

  return 'Which payment or group of payments do you want to add the reported fees to?';
};
