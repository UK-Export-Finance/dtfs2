import { Currency } from '@ukef/dtfs2-common';
import { parseValidatedAddPaymentFormValues } from './parse-validated-add-payment-form-values';
import { ValidatedAddPaymentFormValues } from '../../../types/add-payment-form-values';

describe('parseValidatedAddPaymentFormValues', () => {
  const aValidatedAddPaymentFormValuesObject = (): Omit<ValidatedAddPaymentFormValues, 'addAnotherPayment'> => ({
    paymentCurrency: 'GBP',
    paymentDate: {
      day: '12',
      month: '5',
      year: '2024',
    },
    paymentAmount: '100',
    paymentReference: 'A payment reference',
  });

  it('returns an object containing the supplied payment currency', () => {
    // Arrange
    const paymentCurrency: Currency = 'EUR';
    const formValues = {
      ...aValidatedAddPaymentFormValuesObject(),
      paymentCurrency,
    };

    // Act
    const parsedFormValues = parseValidatedAddPaymentFormValues(formValues);

    // Assert
    expect(parsedFormValues.paymentCurrency).toBe(paymentCurrency);
  });

  it('returns an object containing the supplied payment reference', () => {
    // Arrange
    const paymentReference = 'Some payment reference';
    const formValues = {
      ...aValidatedAddPaymentFormValuesObject(),
      paymentReference,
    };

    // Act
    const parsedFormValues = parseValidatedAddPaymentFormValues(formValues);

    // Assert
    expect(parsedFormValues.paymentReference).toBe(paymentReference);
  });

  it('parses the supplied payment date to a date object', () => {
    // Arrange
    const parsedPaymentDate = new Date('2024-3-2');
    const paymentDate: ValidatedAddPaymentFormValues['paymentDate'] = {
      day: '2',
      month: '3',
      year: '2024',
    };

    const formValues = {
      ...aValidatedAddPaymentFormValuesObject(),
      paymentDate,
    };

    // Act
    const parsedFormValues = parseValidatedAddPaymentFormValues(formValues);

    // Assert
    expect(parsedFormValues.datePaymentReceived).toEqual(parsedPaymentDate);
  });

  it('parses the supplied payment amount to a number when the amount does not contain any commas or decimals', () => {
    // Arrange
    const paymentAmount = 100;
    const paymentAmountAsString = paymentAmount.toString();

    const formValues = {
      ...aValidatedAddPaymentFormValuesObject(),
      paymentAmount: paymentAmountAsString,
    };

    // Act
    const parsedFormValues = parseValidatedAddPaymentFormValues(formValues);

    // Assert
    expect(parsedFormValues.paymentAmount).toBe(paymentAmount);
  });

  it('parses the supplied payment amount to a number when the amount does not contain any commas but has decimals', () => {
    // Arrange
    const paymentAmount = 123.45;
    const paymentAmountAsString = paymentAmount.toString();

    const formValues = {
      ...aValidatedAddPaymentFormValuesObject(),
      paymentAmount: paymentAmountAsString,
    };

    // Act
    const parsedFormValues = parseValidatedAddPaymentFormValues(formValues);

    // Assert
    expect(parsedFormValues.paymentAmount).toBe(paymentAmount);
  });

  it('parses the supplied payment amount to a number when the amount does not contain decimals but has commas', () => {
    // Arrange
    const paymentAmount = 1234567;
    const paymentAmountAsString = '1,234,567';

    const formValues = {
      ...aValidatedAddPaymentFormValuesObject(),
      paymentAmount: paymentAmountAsString,
    };

    // Act
    const parsedFormValues = parseValidatedAddPaymentFormValues(formValues);

    // Assert
    expect(parsedFormValues.paymentAmount).toBe(paymentAmount);
  });

  it('parses the supplied payment amount to a number when the amount contains commas and decimals', () => {
    // Arrange
    const paymentAmount = 1234567.89;
    const paymentAmountAsString = '1,234,567.89';

    const formValues = {
      ...aValidatedAddPaymentFormValuesObject(),
      paymentAmount: paymentAmountAsString,
    };

    // Act
    const parsedFormValues = parseValidatedAddPaymentFormValues(formValues);

    // Assert
    expect(parsedFormValues.paymentAmount).toBe(paymentAmount);
  });
});
