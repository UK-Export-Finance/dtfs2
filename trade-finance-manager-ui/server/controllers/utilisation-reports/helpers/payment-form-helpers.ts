import { Currency } from '@ukef/dtfs2-common';
import { PremiumPaymentsTableCheckboxId } from '../../../types/premium-payments-table-checkbox-id';
import { AddPaymentFormValues } from '../../../types/add-payment-form-values';
import { EditPaymentFormValues } from '../../../types/edit-payment-form-values';
import { AddToAnExistingPaymentErrorsViewModel, PaymentErrorsViewModel } from '../../../types/view-models';
import { validateAddPaymentRequestFormValues, validateAddToAnExistingPaymentRequestFormValues } from './validate-payment-form-values';
import { AddToAnExistingPaymentRadioId } from '../../../types/add-to-an-existing-payment-radio-id';

export type PremiumPaymentsTableCheckboxSelectionsRequestBody = Record<PremiumPaymentsTableCheckboxId, 'on'>;

export type AddPaymentFormRequestBody = PremiumPaymentsTableCheckboxSelectionsRequestBody & {
  paymentCurrency?: string;
  paymentAmount?: string;
  'paymentDate-day'?: string;
  'paymentDate-month'?: string;
  'paymentDate-year'?: string;
  paymentReference?: string;
  addAnotherPayment?: string;
  addPaymentFormSubmission?: string;
};

export const EMPTY_PAYMENT_ERRORS_VIEW_MODEL: PaymentErrorsViewModel = Object.freeze({ errorSummary: [] });

export const EMPTY_ADD_PAYMENT_FORM_VALUES: AddPaymentFormValues = Object.freeze({ paymentDate: {} });

const extractAddPaymentFormValuesFromRequestBody = (requestBody: AddPaymentFormRequestBody): AddPaymentFormValues => ({
  paymentCurrency: requestBody.paymentCurrency,
  paymentAmount: requestBody.paymentAmount,
  paymentDate: {
    day: requestBody['paymentDate-day'],
    month: requestBody['paymentDate-month'],
    year: requestBody['paymentDate-year'],
  },
  paymentReference: requestBody.paymentReference,
  addAnotherPayment: requestBody.addAnotherPayment,
});

export const extractAddPaymentFormValuesAndValidateIfPresent = (
  requestBody: AddPaymentFormRequestBody,
  feeRecordPaymentCurrency: Currency,
): { isAddingPayment: boolean; errors: PaymentErrorsViewModel; formValues: AddPaymentFormValues } => {
  const isAddingPayment = 'addPaymentFormSubmission' in requestBody;

  if (!isAddingPayment) {
    return {
      isAddingPayment,
      errors: EMPTY_PAYMENT_ERRORS_VIEW_MODEL,
      formValues: EMPTY_ADD_PAYMENT_FORM_VALUES,
    };
  }

  const formValues = extractAddPaymentFormValuesFromRequestBody(requestBody);
  const errors = validateAddPaymentRequestFormValues(formValues, feeRecordPaymentCurrency);
  return {
    isAddingPayment,
    formValues,
    errors,
  };
};

export type EditPaymentFormRequestBody = {
  paymentAmount?: string;
  'paymentDate-day'?: string;
  'paymentDate-month'?: string;
  'paymentDate-year'?: string;
  paymentReference?: string;
};

export const extractEditPaymentFormValues = (requestBody: EditPaymentFormRequestBody): EditPaymentFormValues => ({
  paymentAmount: requestBody.paymentAmount,
  paymentDate: {
    day: requestBody['paymentDate-day'],
    month: requestBody['paymentDate-month'],
    year: requestBody['paymentDate-year'],
  },
  paymentReference: requestBody.paymentReference,
});

export type AddToAnExistingPaymentFormRequestBody = {
  paymentGroup?: AddToAnExistingPaymentRadioId;
  addToAnExistingPaymentFormSubmission?: string;
};

const getPaymentIdsFromPaymentGroupRadioId = (radioId: AddToAnExistingPaymentRadioId): number[] => {
  const { commaSeparatedIds } = /paymentIds-(?<commaSeparatedIds>(\d+,?)+)/.exec(radioId)!.groups!;

  return commaSeparatedIds.split(',').map((id) => parseInt(id, 10));
};

const extractAddToAnExistingPaymentRadioPaymentIdsFromRequestBody = (requestBody: AddToAnExistingPaymentFormRequestBody): number[] => {
  if (!requestBody.paymentGroup) {
    return [];
  }

  return getPaymentIdsFromPaymentGroupRadioId(requestBody.paymentGroup);
};

export const extractAddToAnExistingPaymentRadioPaymentIdsAndValidateIfPresent = (
  requestBody: AddToAnExistingPaymentFormRequestBody,
): { isAddingToAnExistingPayment: boolean; errors: AddToAnExistingPaymentErrorsViewModel; paymentIds: number[] } => {
  const isAddingToAnExistingPayment = 'addToAnExistingPaymentFormSubmission' in requestBody;

  if (!isAddingToAnExistingPayment) {
    return {
      isAddingToAnExistingPayment,
      errors: EMPTY_PAYMENT_ERRORS_VIEW_MODEL,
      paymentIds: [],
    };
  }

  const paymentIds = extractAddToAnExistingPaymentRadioPaymentIdsFromRequestBody(requestBody);
  const errors = validateAddToAnExistingPaymentRequestFormValues(paymentIds);

  return {
    isAddingToAnExistingPayment,
    errors,
    paymentIds,
  };
};
