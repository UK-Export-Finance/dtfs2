import { CURRENCY, Currency, isNonEmptyString } from '@ukef/dtfs2-common';
import { isBefore, isValid, parseISO, startOfDay } from 'date-fns';
import { REGEX } from '../../../constants';
import { PaymentErrorsViewModel, PaymentDateErrorViewModel, ErrorSummaryViewModel, AddToAnExistingPaymentErrorsViewModel } from '../../../types/view-models';
import { AddPaymentFormValues } from '../../../types/add-payment-form-values';
import { EditPaymentFormValues } from '../../../types/edit-payment-form-values';

const isCurrencyNumberOptionallyWithThousandsSeparators = (value: string) => {
  const currencyNumberWithOptionalThousandsSeparatorsRegex = /^(\d+|\d{1,3}(,\d{3})+)(\.\d{1,2})?$/;
  return currencyNumberWithOptionalThousandsSeparatorsRegex.test(value);
};

const isPaymentCurrencyValid = (paymentCurrency: string | undefined): paymentCurrency is Currency => {
  return isNonEmptyString(paymentCurrency) && (Object.values(CURRENCY) as string[]).includes(paymentCurrency);
};

const getPaymentCurrencyValidationsErrors = (paymentCurrency: string | undefined, feeRecordPaymentCurrency: Currency): string | undefined => {
  if (!isPaymentCurrencyValid(paymentCurrency)) {
    return 'Select payment currency';
  }
  if (paymentCurrency !== feeRecordPaymentCurrency) {
    return 'The new payment currency must be the same as the reported payment currency of the selected fees';
  }
  return undefined;
};

const isPaymentAmountValid = (paymentAmount: string | undefined): boolean => {
  return isNonEmptyString(paymentAmount) && isCurrencyNumberOptionallyWithThousandsSeparators(paymentAmount);
};

const isAddAnotherPaymentChoiceValid = (addAnotherPaymentChoice: string | undefined): boolean => {
  return isNonEmptyString(addAnotherPaymentChoice) && (addAnotherPaymentChoice === 'true' || addAnotherPaymentChoice === 'false');
};

const isPaymentReferenceOverFiftyCharacters = (paymentReference: string | undefined): boolean => {
  return isNonEmptyString(paymentReference) && paymentReference.length > 50;
};

const isValidDay = (day: string) => {
  return REGEX.INT.test(day) && Number(day) >= 1 && Number(day) <= 31;
};

const isValidMonth = (month: string) => {
  return REGEX.INT.test(month) && Number(month) >= 1 && Number(month) <= 12;
};

const isValidYear = (year: string) => {
  return REGEX.YEAR.test(year);
};

type DateFieldName = 'day' | 'month' | 'year';

const getMissingDateFields = (day: string | undefined, month: string | undefined, year: string | undefined): DateFieldName[] => {
  const missingFields: DateFieldName[] = [];
  if (!isNonEmptyString(day)) {
    missingFields.push('day');
  }

  if (!isNonEmptyString(month)) {
    missingFields.push('month');
  }

  if (!isNonEmptyString(year)) {
    missingFields.push('year');
  }

  return missingFields;
};

const getMissingDateFieldsError = (fieldTitle: string, missingFields: DateFieldName[]): PaymentDateErrorViewModel => {
  if (missingFields.length === 3) {
    return { message: `Enter the ${fieldTitle}`, dayError: true, monthError: true, yearError: true };
  }

  return {
    message: `The ${fieldTitle} must include a ${missingFields.join(' and ')}`,
    dayError: missingFields.includes('day'),
    monthError: missingFields.includes('month'),
    yearError: missingFields.includes('year'),
  };
};

const parseDate = (day: string, month: string, year: string) => {
  /*
   * Calling new Date(`${year}-${month}-${day}`) would parse `2024-02-31` as the 3rd of march (or 2nd depending on the year).
   * However we want to display the 31st of February as invalid to the user and force them to enter a valid date so we instead use date-fns parseISO which treats dates like this as an error.
   */
  const isoDateString = `${year}-${month.length === 1 ? `0${month}` : month}-${day.length === 1 ? `0${day}` : day}`;
  return parseISO(isoDateString);
};

const validatePaymentDateAndReturnErrorIfInvalid = (
  day: string | undefined,
  month: string | undefined,
  year: string | undefined,
): PaymentDateErrorViewModel | undefined => {
  const fieldTitle = 'date payment received';

  const missingFields = getMissingDateFields(day, month, year);
  if (missingFields.length > 0) {
    return getMissingDateFieldsError(fieldTitle, missingFields);
  }

  const dayString = day as string;
  const monthString = month as string;
  const yearString = year as string;

  const hasDayError = !isValidDay(dayString);
  const hasMonthError = !isValidMonth(monthString);
  const hasYearError = !isValidYear(yearString);

  if (hasDayError || hasMonthError || hasYearError) {
    return { message: `The ${fieldTitle} must be a real date`, dayError: hasDayError, monthError: hasMonthError, yearError: hasYearError };
  }

  const date = parseDate(dayString, monthString, yearString);
  if (!isValid(date)) {
    return { message: `The ${fieldTitle} must be a real date`, dayError: true, monthError: true, yearError: true };
  }

  const today = new Date();
  if (!isBefore(date, startOfDay(today))) {
    return { message: `The ${fieldTitle} must be in the past`, dayError: true, monthError: true, yearError: true };
  }

  return undefined;
};

const getPaymentDateHref = (paymentDateError: PaymentDateErrorViewModel): string => {
  if (paymentDateError.dayError) {
    return '#paymentDate-day';
  }

  if (paymentDateError.monthError) {
    return '#paymentDate-month';
  }

  return '#paymentDate-year';
};

const validateCommonPaymentRequestFormValues = (formValues: AddPaymentFormValues | EditPaymentFormValues): PaymentErrorsViewModel => {
  const errorSummary: ErrorSummaryViewModel[] = [];

  const paymentAmountErrorMessage = isPaymentAmountValid(formValues.paymentAmount) ? undefined : 'Enter a valid amount received';
  if (paymentAmountErrorMessage) {
    errorSummary.push({ text: paymentAmountErrorMessage, href: '#paymentAmount' });
  }

  const paymentReferenceErrorMessage = isPaymentReferenceOverFiftyCharacters(formValues.paymentReference)
    ? 'Payment reference must be 50 characters or less'
    : undefined;
  if (paymentReferenceErrorMessage) {
    errorSummary.push({ text: paymentReferenceErrorMessage, href: '#paymentReference' });
  }

  const paymentDateError = validatePaymentDateAndReturnErrorIfInvalid(formValues.paymentDate.day, formValues.paymentDate.month, formValues.paymentDate.year);
  if (paymentDateError) {
    errorSummary.push({ text: paymentDateError.message, href: getPaymentDateHref(paymentDateError) });
  }

  return {
    errorSummary,
    paymentAmountErrorMessage,
    paymentReferenceErrorMessage,
    paymentDateError,
  };
};

export const validateAddPaymentRequestFormValues = (formValues: AddPaymentFormValues, feeRecordPaymentCurrency: Currency): PaymentErrorsViewModel => {
  const errorSummary: ErrorSummaryViewModel[] = [];

  const commonPaymentFormErrors = validateCommonPaymentRequestFormValues(formValues);
  const { paymentAmountErrorMessage, paymentReferenceErrorMessage, paymentDateError } = commonPaymentFormErrors;
  errorSummary.push(...commonPaymentFormErrors.errorSummary);

  const paymentCurrencyErrorMessage = getPaymentCurrencyValidationsErrors(formValues.paymentCurrency, feeRecordPaymentCurrency);
  if (paymentCurrencyErrorMessage) {
    errorSummary.push({ text: paymentCurrencyErrorMessage, href: '#paymentCurrency' });
  }

  const addAnotherPaymentErrorMessage = isAddAnotherPaymentChoiceValid(formValues.addAnotherPayment) ? undefined : 'Select add another payment choice';
  if (addAnotherPaymentErrorMessage) {
    errorSummary.push({ text: addAnotherPaymentErrorMessage, href: '#addAnotherPayment' });
  }

  return {
    errorSummary,
    paymentCurrencyErrorMessage,
    paymentAmountErrorMessage,
    paymentReferenceErrorMessage,
    addAnotherPaymentErrorMessage,
    paymentDateError,
  };
};

export const validateEditPaymentRequestFormValues = (formValues: EditPaymentFormValues): PaymentErrorsViewModel =>
  validateCommonPaymentRequestFormValues(formValues);

export const validateAddToAnExistingPaymentRequestFormValues = (paymentRadioIds: number[]): AddToAnExistingPaymentErrorsViewModel => {
  const errorSummary: ErrorSummaryViewModel[] = [];

  const paymentGroupErrorMessage = paymentRadioIds.length > 0 ? undefined : 'Select a payment to add the fee or fees to';
  if (paymentGroupErrorMessage) {
    errorSummary.push({ text: paymentGroupErrorMessage, href: '#available-payment-groups' });
  }

  return { errorSummary, paymentGroupErrorMessage };
};
