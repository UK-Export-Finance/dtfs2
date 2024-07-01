import { ParsedAddPaymentFormValues, ValidatedAddPaymentFormValues } from '../../../types/add-payment-form-values';

export const parseValidatedAddPaymentFormValues = (
  validatedFormValues: Omit<ValidatedAddPaymentFormValues, 'addAnotherPayment'>,
): ParsedAddPaymentFormValues => {
  const { paymentCurrency, paymentDate, paymentAmount, paymentReference } = validatedFormValues;

  const { day, month, year } = paymentDate;
  const datePaymentReceived = new Date(`${year}-${month}-${day}`);

  const paymentAmountWithoutCommas = paymentAmount.replaceAll(',', '');
  const paymentAmountAsNumber = Number(paymentAmountWithoutCommas);

  return {
    paymentCurrency,
    paymentAmount: paymentAmountAsNumber,
    datePaymentReceived,
    paymentReference,
  };
};
