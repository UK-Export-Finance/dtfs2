import { getMonetaryValueAsNumber } from '@ukef/dtfs2-common';
import { ParsedAddPaymentFormValues, ValidatedAddPaymentFormValues } from '../../../types/add-payment-form-values';
import { ParsedEditPaymentFormValues, ValidatedEditPaymentFormValues } from '../../../types/edit-payment-form-values';

const getDatePaymentReceived = ({ day, month, year }: { day: string; month: string; year: string }): Date => new Date(`${year}-${month}-${day}`);

export const parseValidatedAddPaymentFormValues = (
  validatedFormValues: Omit<ValidatedAddPaymentFormValues, 'addAnotherPayment'>,
): ParsedAddPaymentFormValues => ({
  paymentCurrency: validatedFormValues.paymentCurrency,
  paymentAmount: getMonetaryValueAsNumber(validatedFormValues.paymentAmount),
  datePaymentReceived: getDatePaymentReceived(validatedFormValues.paymentDate),
  paymentReference: validatedFormValues.paymentReference,
});

export const parseValidatedEditPaymentFormValues = (validatedFormValues: ValidatedEditPaymentFormValues): ParsedEditPaymentFormValues => ({
  paymentAmount: getMonetaryValueAsNumber(validatedFormValues.paymentAmount),
  datePaymentReceived: getDatePaymentReceived(validatedFormValues.paymentDate),
  paymentReference: validatedFormValues.paymentReference || null,
});
